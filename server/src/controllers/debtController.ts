import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, debts } from '../db/schema.js';
import { or, and, eq, desc, type InferInsertModel } from 'drizzle-orm';
import { createDebtSchema, updateDebtSchema } from '../schemas/debtSchema.js';
import { z } from 'zod';

/**
 * GET /debts
 * Retrieves a list of debts associated with the authenticated user.
 * Supports filtering by 'pay' (outgoing) or 'receive' (incoming) debts via query params.
 * Defaults to returning all debts where the user is either the lender or the lendee.
 */
export const getDebts = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user!.id;
    const type = req.query.type as string | undefined;

    let query = db.select().from(debts).limit(100);

    if (type === 'pay') {
      // User is the borrower (Lendee)
      query.where(eq(debts.lendeeId, userId));
    } else if (type === 'receive') {
      // User is the lender (Lender)
      query.where(eq(debts.lenderId, userId));
    } else {
      // User is involved as either party
      query.where(or(eq(debts.lendeeId, userId), eq(debts.lenderId, userId)));
    }

    // Newest debts at the top!
    query.orderBy(desc(debts.createdAt));

    const userDebts = await query;
    return res.json(userDebts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /debts/:id
 * Retrieves a single debt record by ID.
 * Access Control: The user must be the Creator, Lender, or Lendee to view the record.
 */
export const getDebtById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.user!.id;

    if (!id) return res.status(400).json({ error: 'Missing ID' });

    const debt = await db.query.debts.findFirst({
      where: and(
        eq(debts.id, id as string),
        or(
          eq(debts.lenderId, userId),
          eq(debts.lendeeId, userId),
          eq(debts.createdBy, userId)
        )
      ),
    });

    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    } else {
      return res.json(debt);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /debts
 * Creates a new debt record.
 * Automatically derives lender/lendee names if valid User IDs are provided.
 */
export const createDebt = async (req: Request, res: Response) => {
  try {
    const body = createDebtSchema.parse(req.body);
    const sessionUserId = res.locals.user!.id;

    if (body.lenderId !== sessionUserId && body.lendeeId !== sessionUserId) {
      return res
        .status(403)
        .json({ error: 'You cannot create a debt between two other people.' });
    }

    let finalLenderName = body.lenderName;
    let finalLendeeName = body.lendeeName;

    // If lenderId is provided, fetch the user's real name from the DB
    if (body.lenderId) {
      const lenderUser = await db.query.users.findFirst({
        where: eq(users.id, body.lenderId),
      });
      if (lenderUser) {
        finalLenderName = lenderUser.firstName;
      }
    }

    // If lendeeId is provided, fetch the user's real name from the DB
    if (body.lendeeId) {
      const lendeeUser = await db.query.users.findFirst({
        where: eq(users.id, body.lendeeId),
      });
      if (lendeeUser) {
        finalLendeeName = lendeeUser.firstName;
      }
    }

    const newDebt = {
      ...body,
      amount: body.amount.toString(),
      createdBy: sessionUserId,
      lenderName: finalLenderName,
      lendeeName: finalLendeeName,
    };

    const result = await db.insert(debts).values(newDebt).returning();

    return res.status(201).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }

    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /debts/:id
 * Updates an existing debt record.
 * Access Control: Only the properties' Creator can update the record.
 * Automatically updates names if IDs are changed.
 */
export const updateDebt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.user!.id;

    const body = updateDebtSchema.parse(req.body);

    let finalLenderName = body.lenderName;
    let finalLendeeName = body.lendeeName;

    // Refresh names if IDs are being updated
    if (body.lenderId) {
      const lenderUser = await db.query.users.findFirst({
        where: eq(users.id, body.lenderId),
      });
      if (lenderUser) {
        finalLenderName = lenderUser.firstName;
      }
    }

    if (body.lendeeId) {
      const lendeeUser = await db.query.users.findFirst({
        where: eq(users.id, body.lendeeId),
      });
      if (lendeeUser) {
        finalLendeeName = lendeeUser.firstName;
      }
    }

    type NewDebt = InferInsertModel<typeof debts>;

    const updateData: Partial<NewDebt> = {
      ...body,
      amount: body.amount?.toString(),
      updatedAt: new Date(),
      lenderName: finalLenderName,
      lendeeName: finalLendeeName,
    };

    // Drizzle ignores undefined values in .set()
    const result = await db
      .update(debts)
      .set(updateData)
      .where(and(eq(debts.id, id as string), eq(debts.createdBy, userId)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Debt not found or unauthorized' });
    }

    return res.json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }

    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /debts/:id
 * Deletes a debt record.
 * Access Control: Only the Creator can delete the record.
 */
export const deleteDebt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.user!.id;

    const result = await db
      .delete(debts)
      .where(and(eq(debts.id, id as string), eq(debts.createdBy, userId)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Debt not found or unauthorized' });
    } else {
      return res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

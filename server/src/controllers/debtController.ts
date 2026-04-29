import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, debts } from '../db/schema.js';
import {
  or,
  and,
  eq,
  desc,
  type InferInsertModel,
  getTableColumns,
  sql,
  ilike,
} from 'drizzle-orm';
import {
  createDebtSchema,
  getDebtsQuerySchema,
  updateDebtSchema,
} from '../schemas/debtSchema.js';
import { z } from 'zod';
import { emailQueue } from '../queues/emailQueue.js';
import { handleDbErrorResponse } from '../lib/utils.js';
import { io } from '../socket.js';
import { alias } from 'drizzle-orm/pg-core';

/**
 * GET /debts
 * Retrieves a list of debts associated with the authenticated user.
 * Supports filtering by 'pay' (outgoing) or 'receive' (incoming) debts via query params.
 * Defaults to returning all debts where the user is either the lender or the lendee.
 *
 * @query {string} type - Optional filter for debt role ('pay' | 'receive').
 * @query {string} status - Optional filter for debt status ('pending' | 'settled').
 */
export const getDebts = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user!.id;

    const queryResult = getDebtsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ errors: queryResult.error.issues });
    }
    const { type, status, fullNames, search } = queryResult.data;
    const lenderUser = alias(users, 'lender_user');
    const lendeeUser = alias(users, 'lendee_user');

    type DebtStatus = (typeof debts.status.enumValues)[number];

    const conditions = [];

    if (type === 'pay') {
      conditions.push(eq(debts.lendeeId, userId));
    } else if (type === 'receive') {
      conditions.push(eq(debts.lenderId, userId));
    } else {
      conditions.push(
        or(eq(debts.lendeeId, userId), eq(debts.lenderId, userId))
      );
    }

    if (status) {
      conditions.push(eq(debts.status, status as DebtStatus));
    }

    if (fullNames === 'true') {
      if (search) {
        conditions.push(
          or(
            ilike(debts.title, `%${search}%`),
            ilike(debts.description, `%${search}%`),
            ilike(sql`${debts.amount}::text`, `%${search}%`),
            ilike(
              sql`CASE WHEN ${debts.lendeeId} = ${userId}
      THEN COALESCE(${lenderUser.firstName} || ' ' || ${lenderUser.lastName}, ${debts.lenderName})
      ELSE COALESCE(${lendeeUser.firstName} || ' ' || ${lendeeUser.lastName}, ${debts.lendeeName})
      END`,
              `%${search}%`
            )
          )
        );
      }

      const result = await db
        .select({
          ...getTableColumns(debts),
          lenderFullName: sql<string>`${lenderUser.firstName} || ' ' || ${lenderUser.lastName}`,
          lendeeFullName: sql<string>`${lendeeUser.firstName} || ' ' || ${lendeeUser.lastName}`,
        })
        .from(debts)
        .leftJoin(lenderUser, eq(debts.lenderId, lenderUser.id))
        .leftJoin(lendeeUser, eq(debts.lendeeId, lendeeUser.id))
        .where(and(...conditions))
        .orderBy(desc(debts.createdAt))
        .limit(search ? 50 : 25);
      return res.json(result);
    }

    const result = await db
      .select()
      .from(debts)
      .where(and(...conditions))
      .orderBy(desc(debts.createdAt))
      .limit(100);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /debts/:id
 * Retrieves a single debt record by ID.
 * Access Control: The user must be the Creator, Lender, or Lendee to view the record.
 *
 * @param {string} id - The UUID of the debt.
 */
export const getDebtById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.user!.id;

    const idResult = z.string().uuid().safeParse(id);
    if (!idResult.success)
      return res.status(400).json({ error: 'Invalid debt ID' });

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
 *
 * @body {string} title - The title/description of the debt.
 * @body {string} amount - The initial debt amount.
 * @body {string} [lenderId] - Optional UUID of the lender.
 * @body {string} [lendeeId] - Optional UUID of the lendee.
 */
export const createDebt = async (req: Request, res: Response) => {
  try {
    const body = createDebtSchema.parse(req.body);
    const sessionUserId = res.locals.user!.id;

    if (body.lenderId !== sessionUserId && body.lendeeId !== sessionUserId) {
      return res
        .status(403)
        .json({ error: 'You cannot create a debt between two other people' });
    }

    let finalLenderName = body.lenderName;
    let finalLendeeName = body.lendeeName;

    const [lenderUser, lendeeUser] = await Promise.all([
      body.lenderId
        ? db.query.users.findFirst({ where: eq(users.id, body.lenderId) })
        : Promise.resolve(null),
      body.lendeeId
        ? db.query.users.findFirst({ where: eq(users.id, body.lendeeId) })
        : Promise.resolve(null),
    ]);

    // Refresh names if IDs are provided

    if (lenderUser) {
      finalLenderName = lenderUser.firstName;
    }

    if (lendeeUser) {
      finalLendeeName = lendeeUser.firstName;
    }

    const newDebt = {
      ...body,
      amount: body.amount.toString(),
      createdBy: sessionUserId,
      lenderName: finalLenderName,
      lendeeName: finalLendeeName,
    };

    const result = await db.insert(debts).values(newDebt).returning();

    // email jobs added if result returns a non-empty array
    if (result.length === 0) {
      return res.status(500).json({ error: 'Insert failed' });
    } else {
      // socket updates to each party
      if (result[0]!.lenderId) {
        io.to(result[0]!.lenderId).emit('debt:created', result[0]);
      }
      if (result[0]!.lendeeId) {
        io.to(result[0]!.lendeeId).emit('debt:created', result[0]);
      }

      const emailJobs = [];

      if (lenderUser?.email) {
        emailJobs.push(
          emailQueue.add('lenderCreationEmail', {
            to: lenderUser.email,
            name: finalLenderName,
            amount: body.amount,
            currency: body.currency,
            otherPartyName: finalLendeeName,
            title: body.title,
            role: 'lender',
          })
        );
      }
      if (lendeeUser?.email) {
        emailJobs.push(
          emailQueue.add('lendeeCreationEmail', {
            to: lendeeUser.email,
            name: finalLendeeName,
            amount: body.amount,
            currency: body.currency,
            otherPartyName: finalLenderName,
            title: body.title,
            role: 'lendee',
          })
        );
      }

      Promise.allSettled(emailJobs).then((results) => {
        results.forEach((result) => {
          if (result.status === 'rejected') {
            console.error('Failed to queue email:', result.reason);
          }
        });
      });
    }

    return res.status(201).json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }

    if (handleDbErrorResponse(error, res)) return;

    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /debts/:id
 * Updates an existing debt record.
 * Access Control: Only the properties' Creator can update the record.
 * Automatically updates names if IDs are changed.
 *
 * @param {string} id - The UUID of the debt.
 */
export const updateDebt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.user!.id;

    const idResult = z.string().uuid().safeParse(id);
    if (!idResult.success)
      return res.status(400).json({ error: 'Invalid debt ID' });

    const body = updateDebtSchema.parse(req.body);

    let finalLenderName = body.lenderName;
    let finalLendeeName = body.lendeeName;

    const [lenderUser, lendeeUser] = await Promise.all([
      body.lenderId
        ? db.query.users.findFirst({ where: eq(users.id, body.lenderId) })
        : Promise.resolve(null),
      body.lendeeId
        ? db.query.users.findFirst({ where: eq(users.id, body.lendeeId) })
        : Promise.resolve(null),
    ]);

    // Refresh names if IDs are being updated
    if (lenderUser) {
      finalLenderName = lenderUser.firstName;
    }
    if (lendeeUser) {
      finalLendeeName = lendeeUser.firstName;
    }

    type NewDebt = InferInsertModel<typeof debts>;

    const updateData: Partial<NewDebt> = {
      ...body,
      amount: body.amount?.toString(),
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
    } else {
      // socket updates to each party
      if (result[0]!.lenderId) {
        io.to(result[0]!.lenderId).emit('debt:updated', result[0]);
      }
      if (result[0]!.lendeeId) {
        io.to(result[0]!.lendeeId).emit('debt:updated', result[0]);
      }

      return res.json(result[0]);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }

    if (handleDbErrorResponse(error, res)) return;

    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /debts/:id
 * Deletes a debt record.
 * Access Control: Only the Creator can delete the record.
 *
 * @param {string} id - The UUID of the debt.
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
      // socket updates to each party
      if (result[0]!.lenderId) {
        io.to(result[0]!.lenderId).emit('debt:deleted', result[0]);
      }
      if (result[0]!.lendeeId) {
        io.to(result[0]!.lendeeId).emit('debt:deleted', result[0]);
      }

      return res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

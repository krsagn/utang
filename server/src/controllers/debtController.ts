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

function resolveParties(
  type: 'pay' | 'receive',
  sessionUserId: string,
  otherPartyId?: string
) {
  return type === 'pay'
    ? { lenderId: otherPartyId ?? null, lendeeId: sessionUserId }
    : { lenderId: sessionUserId, lendeeId: otherPartyId ?? null };
}

/**
 * GET /debts
 * Retrieves a list of debts associated with the authenticated user.
 * Supports filtering by 'pay' (outgoing) or 'receive' (incoming) debts via query params.
 * Defaults to returning all debts where the user is either the lender or the lendee.
 *
 * @query {string} type - Optional filter for debt role ('pay' | 'receive').
 * @query {string} status - Optional filter for debt status ('pending' | 'paid' | 'void').
 * @query {string} search - Optional search string matched against title, description, amount, and other party name.
 */
export const getDebts = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user!.id;

    const queryResult = getDebtsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ errors: queryResult.error.issues });
    }
    const { type, status, search } = queryResult.data;
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

    if (search) {
      conditions.push(
        or(
          ilike(debts.title, `%${search}%`),
          ilike(debts.description, `%${search}%`),
          ilike(sql`${debts.amount}::text`, `%${search}%`),
          ilike(
            sql`CASE WHEN ${debts.lendeeId} = ${userId}
      THEN COALESCE(${lenderUser.firstName} || ' ' || ${lenderUser.lastName}, ${debts.strangerName})
      ELSE COALESCE(${lendeeUser.firstName} || ' ' || ${lendeeUser.lastName}, ${debts.strangerName})
      END`,
            `%${search}%`
          )
        )
      );
    }

    const result = await db
      .select({
        ...getTableColumns(debts),
        lenderFirstName: lenderUser.firstName,
        lenderLastName: lenderUser.lastName,
        lendeeFirstName: lendeeUser.firstName,
        lendeeLastName: lendeeUser.lastName,
      })
      .from(debts)
      .leftJoin(lenderUser, eq(debts.lenderId, lenderUser.id))
      .leftJoin(lendeeUser, eq(debts.lendeeId, lendeeUser.id))
      .where(and(...conditions))
      .orderBy(desc(debts.createdAt))
      .limit(search ? 50 : 100);
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
    const sessionUserId = res.locals.user!.id;

    const idResult = z.string().uuid().safeParse(id);
    if (!idResult.success)
      return res.status(400).json({ error: 'Invalid debt ID' });

    const lenderUser = alias(users, 'lender_user');
    const lendeeUser = alias(users, 'lendee_user');

    const result = await db
      .select({
        ...getTableColumns(debts),
        lenderFirstName: lenderUser.firstName,
        lenderLastName: lenderUser.lastName,
        lendeeFirstName: lendeeUser.firstName,
        lendeeLastName: lendeeUser.lastName,
      })
      .from(debts)
      .leftJoin(lenderUser, eq(debts.lenderId, lenderUser.id))
      .leftJoin(lendeeUser, eq(debts.lendeeId, lendeeUser.id))
      .where(
        and(
          eq(debts.id, id as string),
          or(
            eq(debts.lenderId, sessionUserId),
            eq(debts.lendeeId, sessionUserId),
            eq(debts.createdBy, sessionUserId)
          )
        )
      );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Debt not found' });
    } else {
      return res.json(result[0]);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /debts
 * Creates a new debt record.
 * Derives lender/lendee IDs from the session user and otherPartyId based on type.
 *
 * @body {'pay' | 'receive'} type - Whether the session user owes or is owed.
 * @body {string} [otherPartyId] - UUID of the other party if they are a registered user.
 * @body {string} [strangerName] - Name of the other party if they are not a registered user.
 * @body {string} currency - Three-letter currency code.
 * @body {number} amount - The debt amount.
 * @body {string} title - Short title for the debt.
 * @body {string} [description] - Optional description.
 * @body {Date} [deadline] - Optional repayment deadline.
 */
export const createDebt = async (req: Request, res: Response) => {
  try {
    const {
      type,
      otherPartyId,
      strangerName,
      currency,
      amount,
      title,
      description,
      deadline,
    } = createDebtSchema.parse(req.body);
    const sessionUserId = res.locals.user!.id;
    const { lenderId, lendeeId } = resolveParties(
      type,
      sessionUserId,
      otherPartyId
    );

    const newDebt = {
      createdBy: sessionUserId,
      lenderId,
      lendeeId,
      strangerName,
      currency,
      amount: amount.toString(),
      title,
      description,
      deadline,
    };

    const result = await db.insert(debts).values(newDebt).returning();

    // email jobs added if result returns a non-empty array
    if (result.length === 0) {
      return res.status(500).json({ error: 'Insert failed' });
    } else {
      const [lenderUser, lendeeUser] = await Promise.all([
        lenderId
          ? db.query.users.findFirst({ where: eq(users.id, lenderId) })
          : Promise.resolve(null),
        lendeeId
          ? db.query.users.findFirst({ where: eq(users.id, lendeeId) })
          : Promise.resolve(null),
      ]);

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
            name: lenderUser.firstName,
            amount: amount,
            currency: currency,
            otherPartyName: lendeeUser
              ? `${lendeeUser.firstName} ${lendeeUser.lastName}`
              : strangerName,
            title: title,
            role: 'lender',
          })
        );
      }
      if (lendeeUser?.email) {
        emailJobs.push(
          emailQueue.add('lendeeCreationEmail', {
            to: lendeeUser.email,
            name: lendeeUser.firstName,
            amount: amount,
            currency: currency,
            otherPartyName: lenderUser
              ? `${lenderUser.firstName} ${lenderUser.lastName}`
              : strangerName,
            title: title,
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
 * Access Control: Only the Creator can update the record.
 * Re-derives lender/lendee IDs from the existing debt and otherPartyId if provided.
 *
 * @param {string} id - The UUID of the debt.
 */
export const updateDebt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionUserId = res.locals.user!.id;

    const idResult = z.string().uuid().safeParse(id);
    if (!idResult.success)
      return res.status(400).json({ error: 'Invalid debt ID' });

    const {
      otherPartyId,
      strangerName,
      currency,
      amount,
      title,
      description,
      deadline,
      status,
    } = updateDebtSchema.parse(req.body);

    const debt = await db.query.debts.findFirst({
      where: and(
        eq(debts.id, id as string),
        eq(debts.createdBy, sessionUserId)
      ),
    });

    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }

    let lenderId;
    let lendeeId;

    if (debt.lenderId === sessionUserId) {
      lenderId = sessionUserId;
      lendeeId = strangerName ? null : otherPartyId;
    } else {
      lenderId = strangerName ? null : otherPartyId;
      lendeeId = sessionUserId;
    }

    type NewDebt = InferInsertModel<typeof debts>;

    const updateData: Partial<NewDebt> = {
      lenderId,
      lendeeId,
      strangerName: otherPartyId ? null : strangerName,
      currency,
      amount: amount?.toString(),
      title,
      description,
      deadline,
      status,
    };

    // Drizzle ignores undefined values in .set()
    const result = await db
      .update(debts)
      .set(updateData)
      .where(
        and(eq(debts.id, id as string), eq(debts.createdBy, sessionUserId))
      )
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
    const sessionUserId = res.locals.user!.id;

    const result = await db
      .delete(debts)
      .where(
        and(eq(debts.id, id as string), eq(debts.createdBy, sessionUserId))
      )
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

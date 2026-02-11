// 1. Import 'Request' and 'Response' from express
import type { Request, Response } from 'express';

// 2. Import your database client and schema
import { db } from '../db/index.js';
import { debts } from '../db/schema.js';
import { eq, type InferInsertModel } from 'drizzle-orm';

// 3. Zod imports for validation
import { createDebtSchema, updateDebtSchema } from '../schemas/debtSchema.js';
import { z } from 'zod';

/**
 * GET /debts
 * Returns all debt records from the database.
 */
export const getDebts = async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(debts);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /debts/:id
 * Returns a single debt record by its ID.
 */
export const getDebtById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Use eq() to filter by ID. Drizzle returns an array, so we check if it's empty.
    const result = await db
      .select()
      .from(debts)
      .where(eq(debts.id, Number(id)));

    if (result.length === 0) {
      res.status(404).json({ error: 'Debt not found' });
    } else {
      res.json(result[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /debts
 * Validates the request body and creates a new debt record.
 */
export const createDebt = async (req: Request, res: Response) => {
  try {
    // 1. Validate the incoming request body using Zod
    const body = createDebtSchema.parse(req.body);

    // 2. Insert into database using Drizzle.
    // We convert amount to string to satisfy the Decimal column requirements.
    const result = await db
      .insert(debts)
      .values({ ...body, amount: body.amount.toString() })
      .returning();

    // 3. Send back the newly created record
    res.status(201).json(result[0]);
  } catch (error) {
    // Specifically handle Zod validation errors
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.issues });
      return;
    }

    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /debts/:id
 * Partially updates a debt record. Handles dynamic fields using Drizzle.
 */
export const updateDebt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Zod schema validation (all fields are optional in update schema)
    const body = updateDebtSchema.parse(req.body);

    // 2. Prepare the update data.
    // InferInsertModel gives us the correct shape for the DB operation.
    type NewDebt = InferInsertModel<typeof debts>;

    const updateData: Partial<NewDebt> = {
      ...body,
      // Only convert to string if amount was actually provided
      amount: body.amount?.toString(),
    };

    // 3. Perform the update. Drizzle ignores undefined values in the .set() object.
    const result = await db
      .update(debts)
      .set(updateData)
      .where(eq(debts.id, Number(id)))
      .returning();

    // If no row found (ID doesn't exist)
    if (result.length === 0) {
      res.status(404).json({ error: 'Debt not found' });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.issues });
      return;
    }

    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /debts/:id
 * Removes a debt record from the database.
 */
export const deleteDebt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // .returning() tells Drizzle to return the deleted row so we can check if it existed
    const result = await db
      .delete(debts)
      .where(eq(debts.id, Number(id)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Debt not found' });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

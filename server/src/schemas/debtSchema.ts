import { z } from 'zod';

// Define the shape of the incoming request body (POST)
export const createDebtSchema = z.object({
  // Required fields: lender and lendee
  lender: z.string().min(1, 'Lender name is required'),
  lendee: z.string().min(1, 'Lendee name is required'),

  // Lent amount must be positive
  amount: z.number().positive(),

  // Description is optional
  description: z.string().optional(),
});

// Same shape as createDebtSchema, partial() makes all fields optional
export const updateDebtSchema = createDebtSchema.partial().extend({
  status: z.enum(['PENDING', 'PAID', 'VOID']).optional(),
});

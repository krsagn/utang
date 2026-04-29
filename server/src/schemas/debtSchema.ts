import { z } from 'zod';

// Define the shape of the incoming request body (POST)
export const createDebtSchema = z.object({
  // parties involved
  lenderId: z.string().uuid().optional(),
  lendeeId: z.string().uuid().optional(),
  lenderName: z.string().min(1, 'Lender name is required'),
  lendeeName: z.string().min(1, 'Lendee name is required'),

  // Lent amount must be positive, and capped locally at ~10M for real-life usage
  currency: z.string().length(3).toUpperCase(),
  amount: z.coerce
    .number()
    .positive()
    .max(9999999.99, 'Amount cannot exceed 9,999,999.99'),

  // Description is optional
  title: z.string().min(1, 'Title is required').max(30, 'Title too long'),
  description: z.string().max(100, 'Description too long').optional(),

  // Deadline is optional
  deadline: z.coerce.date().optional(),
});

// Same shape as createDebtSchema, partial() makes all fields optional
export const updateDebtSchema = createDebtSchema.partial().extend({
  status: z.enum(['pending', 'paid', 'void']).optional(),
});

// Query params for GET /debts
export const getDebtsQuerySchema = z
  .object({
    type: z.enum(['pay', 'receive']).optional(),
    status: z.enum(['pending', 'paid', 'void']).optional(),
    fullNames: z.enum(['true', 'false']).optional(),
    search: z.string().max(100).optional(),
  })
  .strict();

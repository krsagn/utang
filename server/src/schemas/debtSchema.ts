import { z } from 'zod';

export const baseDebtSchema = z.object({
  // parties involved
  otherPartyId: z.string().uuid().optional(),
  strangerName: z.string().trim().min(1).optional(),

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

// Extends baseDebtSchema with type, and enforces exactly one of strangerName or otherPartyId
export const createDebtSchema = baseDebtSchema
  .extend({ type: z.enum(['pay', 'receive']) })
  .refine((data) => data.strangerName || data.otherPartyId, {
    message: 'Provide a stranger name or ID of other party',
  })
  .refine((data) => !(data.otherPartyId && data.strangerName), {
    message: 'Cannot provide both other party ID and stranger name',
  });

// All fields optional; rejects requests that provide both otherPartyId and strangerName
export const updateDebtSchema = baseDebtSchema
  .partial()
  .extend({
    status: z.enum(['pending', 'paid', 'void']).optional(),
  })
  .refine((data) => !(data.otherPartyId && data.strangerName), {
    message: 'Cannot provide both other party ID and stranger name',
  });

// Query params for GET /debts
export const getDebtsQuerySchema = z
  .object({
    type: z.enum(['pay', 'receive']).optional(),
    status: z.enum(['pending', 'paid', 'void']).optional(),
    search: z.string().max(100).optional(),
  })
  .strict();

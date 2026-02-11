import { pgTable, serial, text, decimal, timestamp } from 'drizzle-orm/pg-core';

export const debts = pgTable('debts', {
  id: serial('id').primaryKey(),
  lender: text('lender').notNull(),
  lendee: text('lendee').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  deadline: timestamp('deadline'),
  status: text('status').default('PENDING'),
});

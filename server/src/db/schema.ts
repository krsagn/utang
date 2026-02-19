import {
  pgTable,
  text,
  decimal,
  timestamp,
  check,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const debts = pgTable(
  'debts',
  {
    // identity-related
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // parties involved
    lenderName: text('lender_name').notNull(),
    lenderId: text('lender_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    lendeeName: text('lendee_name').notNull(),
    lendeeId: text('lendee_id').references(() => users.id, {
      onDelete: 'cascade',
    }),

    // core data
    currency: text('currency').notNull().default('AUD'),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    title: text('title').notNull(),
    description: text('description'),

    // metadata
    createdAt: timestamp('created_at').defaultNow(),
    deadline: timestamp('deadline'),
    status: text('status').default('pending'),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      'one-participant-check',
      sql`${table.lenderId} IS NOT NULL OR ${table.lendeeId} IS NOT NULL`
    ),
  ]
);

export const friendships = pgTable(
  'friendships',
  {
    // friendship identifier for ORM's sake
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // handle sorting as a check AND in controller
    userId1: text('user_id_1')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    userId2: text('user_id_2')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // friendship data
    status: text('status', { enum: ['pending', 'accepted'] })
      .notNull()
      .default('pending'),
    requesterId: text('requester_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // make sure this is handled in controller as well
    check('force_order', sql`${table.userId1} < ${table.userId2}`),
    check(
      'requester_is_participant',
      sql`${table.requesterId} = ${table.userId1} OR ${table.requesterId} = ${table.userId2}`
    ),
    // cares about order, so reverse order of IDs slip through this check, hence the force order check
    unique('unique_pair').on(table.userId1, table.userId2),
  ]
);

import {
  pgTable,
  text,
  decimal,
  timestamp,
  check,
  unique,
  index,
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

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [index('idx_sessions_user_id').on(table.userId)]
);

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
    // Ensures a debt record cannot exist without at least one assigned participant
    check(
      'one-participant-check',
      sql`${table.lenderId} IS NOT NULL OR ${table.lendeeId} IS NOT NULL`
    ),
    index('idx_debts_lender').on(table.lenderId),
    index('idx_debts_lendee').on(table.lendeeId),
    index('idx_debts_created_by').on(table.createdBy),
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
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Enforce alphabetical sort (userId1 < userId2) to prevent bi-directional duplicate pairs (A->B vs B->A)
    check('force_order', sql`${table.userId1} < ${table.userId2}`),

    // Security check: The user initiating the request must be one of the two participants
    check(
      'requester_is_participant',
      sql`${table.requesterId} = ${table.userId1} OR ${table.requesterId} = ${table.userId2}`
    ),

    // The unique pair index works flawlessly because 'force_order' guarantees consistent left-to-right storage
    unique('unique_pair').on(table.userId1, table.userId2),
    index('idx_friendships_user1').on(table.userId1),
    index('idx_friendships_user2').on(table.userId2),
    index('idx_friendships_requester').on(table.requesterId),
  ]
);

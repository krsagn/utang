import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import type { InferSelectModel } from 'drizzle-orm';
import { db } from './db/index.js';
import { sessions, users } from './db/schema.js';

// attaches Lucia to tables: sessions & users
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

// rules for Lucia
export const lucia = new Lucia(adapter, {
  // cookie rules, secure (https) only when in production
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  // Lucia only gets id by default, make it get email & name with it
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
    };
  },
});

type User = InferSelectModel<typeof users>;

// type definitions for email & name (for TypeScript's sake)
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<User, 'passwordHash' | 'createdAt'>; // only get email and name
  }
}

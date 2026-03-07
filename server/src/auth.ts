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
      username: attributes.username,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
    };
  },
});

type User = InferSelectModel<typeof users>;

// Inject database fields into Lucia's default User type.
// This ensures res.locals.user includes email, name, etc. with perfect type safety.
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<User, 'passwordHash' | 'createdAt'>; // only get email and name
  }
}

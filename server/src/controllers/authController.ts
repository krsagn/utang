import { signUpSchema, logInSchema } from '../schemas/userSchema.js';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { lucia } from '../auth.js';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';

/**
 * POST /auth/signup
 * Creates a new user account, hashes the password, and starts a session.
 * Rejects duplicate emails/usernames.
 */
export const signUp = async (req: Request, res: Response) => {
  try {
    // 1. Validate input and strip password from return object
    const { password, ...userData } = signUpSchema.parse(req.body);

    const passwordHash = await argon2.hash(password);
    const userId = crypto.randomUUID();

    // 2. Create User
    await db.insert(users).values({
      ...userData,
      id: userId,
      passwordHash: passwordHash,
    });

    // 3. Create Session
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.appendHeader('Set-Cookie', sessionCookie.serialize());

    return res.status(201).json({
      message: 'User created',
      user: { id: userId, ...userData },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Validation error' });
    }

    // Handle Unique Key violations (Postgres Error 23505)
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ error: 'Email or username already exists' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /auth/login
 * Verifies credentials and starts a new session.
 */
export const logIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = logInSchema.parse(req.body);

    // 1. Find User by Email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // 2. Verify Password
    const validPassword = await argon2.verify(user.passwordHash, password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // 3. Create Session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.appendHeader('Set-Cookie', sessionCookie.serialize());

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error ' });
  }
};

/**
 * POST /auth/logout
 * Invalidates the current session and clears the session cookie.
 */
export const logOut = async (_req: Request, res: Response) => {
  const session = res.locals.session;
  if (!session) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  res.appendHeader('Set-Cookie', sessionCookie.serialize());

  return res.status(200).json({ message: 'Logged out' });
};

/**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 * Used by the frontend to restore session state on page load.
 */
export const getMe = async (_req: Request, res: Response) => {
  const user = res.locals.user;
  if (!user) {
    return res.status(200).json({ user: null });
  }
  return res.status(200).json({ user });
};

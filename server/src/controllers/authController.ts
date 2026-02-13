import { signUpSchema, logInSchema } from '../schemas/userSchema.js';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { lucia } from '../auth.js';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';

// SIGNUP: Create a New User
export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = signUpSchema.parse(req.body);

    const passwordHash = await argon2.hash(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email: email,
      name: name,
      passwordHash: passwordHash,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.appendHeader('Set-Cookie', sessionCookie.serialize());

    return res.status(201).json({
      message: 'User created',
      user: { id: userId, email: email, name: name },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Validation error' });
    }

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// LOGIN: Verify & Create Session
export const logIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = logInSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const validPassword = await argon2.verify(user.passwordHash, password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.appendHeader('Set-Cookie', sessionCookie.serialize());

    return res
      .status(200)
      .json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error ' });
  }
};

// LOGOUT: Destroy Session
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

// GET ME: Check who is currently logged in
export const getMe = async (_req: Request, res: Response) => {
  const user = res.locals.user;
  if (!user) {
    return res.status(200).json({ user: null });
  }
  return res.status(200).json({ user });
};

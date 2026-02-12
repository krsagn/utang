import { lucia } from '../auth.js';
import type { Request, Response, NextFunction } from 'express';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? '');

  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.appendHeader('Set-Cookie', sessionCookie.serialize());
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    res.appendHeader('Set-Cookie', sessionCookie.serialize());
  }

  res.locals.user = user;
  res.locals.session = session;

  return next();
};

export const requireAuth = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!res.locals.user) {
    return res.status(401).json({ error: 'Unauthorized ' });
  }
  return next();
};

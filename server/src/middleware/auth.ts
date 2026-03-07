import { lucia } from '../auth.js';
import type { Request, Response, NextFunction } from 'express';

/**
 * Global authentication middleware.
 * Intercepts every incoming request to validate the Lucia session cookie.
 * If valid, attaches the `user` and `session` objects to `res.locals`.
 *
 * Security Feature: Handles automatic session extension (sliding window) by
 * issuing a fresh cookie if the current active session is close to expiring.
 */
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

/**
 * Route-specific authorization guard.
 * Must be placed explicitly AFTER `authMiddleware` in the router chain.
 * Rejects requests with 401 Unauthorized if the user is not authenticated.
 */
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

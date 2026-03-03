import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, friendships } from '../db/schema.js';
import { and, eq, ilike, ne, notExists, or, sql } from 'drizzle-orm';

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = res.locals.user!.id;
    const q = (req.query.q as string)?.trim();

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ error: 'Query must be at least 2 characters' });
    }

    const searchPattern = `%${q}%`;

    const results = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
      })
      .from(users)
      .where(
        and(
          ne(users.id, currentUserId),
          or(
            ilike(users.username, searchPattern),
            ilike(
              sql`${users.firstName} || ' ' || ${users.lastName}`,
              searchPattern
            )
          ),
          notExists(
            db
              .select({ one: sql`1` })
              .from(friendships)
              .where(
                and(
                  or(
                    eq(friendships.userId1, currentUserId),
                    eq(friendships.userId2, currentUserId)
                  ),
                  or(
                    eq(friendships.userId1, users.id),
                    eq(friendships.userId2, users.id)
                  )
                )
              )
          )
        )
      )
      .limit(10);

    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, friendships } from '../db/schema.js';
import { and, eq, ne, or } from 'drizzle-orm';
import {
  addFriendSchema,
  acceptFriendSchema,
} from '../schemas/friendshipSchema.js';
import { z } from 'zod';

/**
 * GET /friendships
 * Retrieves a list of friendships associated with the authenticated user.
 * Supports filtering by status via query params.
 * Defaults to returning all friendships regardless of status.
 *
 * @query {string} type - Optional status filter ('pending' | 'accepted').
 */
export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user!.id;
    const type = req.query.type as string | undefined;

    const whereConditions = [
      or(eq(friendships.userId1, userId), eq(friendships.userId2, userId)),
    ];

    if (type) {
      whereConditions.push(
        eq(friendships.status, type as 'pending' | 'accepted')
      );
    }

    const result = await db
      .select({
        id: friendships.id,
        status: friendships.status,
        createdAt: friendships.createdAt,

        friendId: users.id,
        friendFirstName: users.firstName,
        friendLastName: users.lastName,
        friendUsername: users.username,
      })
      .from(friendships)
      .leftJoin(
        users,
        and(
          or(
            eq(friendships.userId1, users.id),
            eq(friendships.userId2, users.id)
          ),
          ne(users.id, userId)
        )
      )
      .where(and(...whereConditions))
      .limit(100);

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /friendships
 * Sends a friend request to another user by username.
 *
 * @body {string} username - The username of the user to add.
 *
 * Logic:
 * - Sorts IDs (userId1 < userId2) to enforce database uniqueness constraints.
 * - Prevents users from adding themselves.
 * - Checks if a request already exists (bi-directional check).
 */
export const addFriend = async (req: Request, res: Response) => {
  try {
    const { username } = addFriendSchema.parse(req.body);
    const requesterId = res.locals.user!.id;

    const targetUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (targetUser.id === requesterId) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    const targetId = targetUser.id;
    const [userId1, userId2] = [requesterId, targetId].sort();

    const friendRequest = {
      requesterId: requesterId,
      userId1: userId1,
      userId2: userId2,
    };

    const result = await db
      .insert(friendships)
      .values(friendRequest)
      .returning();

    return res.status(201).json(result[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.issues });
      return;
    }

    // Handle Unique Key violations (Postgres Error 23505)
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Friend request already exists or you are already friends.',
      });
    }

    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /friendships/:id
 * Updates the status of a friendship (e.g., 'accepted').
 *
 * @param {string} id - The UUID of the friendship.
 * @body {string} status - New status (e.g., 'accepted').
 *
 * Access Control:
 * - Security: The 'requester' cannot accept their own request.
 * - Only the recipient (the other party) can accept.
 */
export const acceptFriend = async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user!.id;
    const { id } = req.params;
    const { status } = acceptFriendSchema.parse(req.body);

    const result = await db
      .update(friendships)
      .set({ status: status })
      .where(
        and(
          eq(friendships.id, id as string),
          // requester is not allowed to accept the friend request themselves
          ne(friendships.requesterId, currentUser),
          // make sure user is actually one of the participants
          or(
            eq(friendships.userId1, currentUser),
            eq(friendships.userId2, currentUser)
          )
        )
      )
      .returning();

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: 'Request not found or unauthorized' });
    }

    return res.json(result[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }

    console.error(error);
    return res.status(500).json({ errors: 'Server Error' });
  }
};

/**
 * DELETE /friendships/:id
 * Deletes a friendship record.
 * Triggered on rejection, withdrawal, or unadding.
 *
 * @param {string} id - The UUID of the friendship.
 *
 * Access Control:
 * - Both users can delete the friendship.
 */
export const deleteFriend = async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user!.id;
    const { id } = req.params;

    const result = await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.id, id as string),
          or(
            eq(friendships.userId1, currentUser),
            eq(friendships.userId2, currentUser)
          )
        )
      )
      .returning();

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: 'Request not found or unauthorized' });
    }

    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: 'Server Error' });
  }
};

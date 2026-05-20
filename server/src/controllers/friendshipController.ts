import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, friendships, debts } from '../db/schema.js';
import { and, eq, isNull, ne, or } from 'drizzle-orm';
import { addFriendSchema } from '../schemas/friendshipSchema.js';
import { z } from 'zod';
import { isDbError } from '../lib/utils.js';
import { io } from '../socket.js';
import { emailQueue } from '../queues/emailQueue.js';
import { createRedisConnection } from '../db/redis.js';

const redis = createRedisConnection();

const NUDGE_COOLDOWN_SECONDS =
  parseInt(process.env.NUDGE_COOLDOWN_SECONDS ?? '300', 10) || 300;

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

    if (type === 'pending') {
      whereConditions.push(ne(friendships.requesterId, userId));
    }

    const result = await db
      .select({
        id: friendships.id,
        status: friendships.status,
        createdAt: friendships.createdAt,
        updatedAt: friendships.updatedAt,

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
 * Sends a friend request to another user by their ID.
 *
 * @body {string} id - The UUID of the user to add.
 *
 * Logic:
 * - Sorts IDs (userId1 < userId2) to enforce database uniqueness constraints.
 * - Prevents users from adding themselves.
 * - Checks if a request already exists (bi-directional check).
 */
export const addFriend = async (req: Request, res: Response) => {
  try {
    const { id: targetUserId } = addFriendSchema.parse(req.body);
    const requesterId = res.locals.user!.id;

    if (targetUserId === requesterId) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    // verify if user exists
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [userId1, userId2] = [requesterId, targetUserId].sort();

    const friendRequest = {
      requesterId: requesterId,
      userId1: userId1,
      userId2: userId2,
    };

    const result = await db
      .insert(friendships)
      .values(friendRequest)
      .returning();

    if (result.length === 0) {
      return res.status(500).json({ error: 'Insert failed' });
    } else {
      // socket updates to each party
      if (targetUserId) {
        io.to(targetUserId).emit('friendship:requested', result[0]);
      }

      return res.status(201).json(result[0]);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.issues });
      return;
    }

    // Handle Unique Key violations (Postgres Error 23505)
    if (isDbError(error)) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'Friend request already exists or you are already friends',
        });
      }
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
 *
 * Access Control:
 * - Security: The 'requester' cannot accept their own request.
 * - Only the recipient (the other party) can accept.
 */
export const acceptFriend = async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user!.id;
    const { id } = req.params;

    const result = await db
      .update(friendships)
      .set({ status: 'accepted' })
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
    } else {
      io.to(result[0]!.requesterId).emit('friendship:accepted', result[0]);

      return res.json(result[0]);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
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
    } else {
      const otherUserId =
        result[0]!.userId1 === currentUser
          ? result[0]!.userId2
          : result[0]!.userId1;

      io.to(otherUserId).emit('friendship:deleted', result[0]);

      return res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /friendships/:friendshipId/stats
 * Returns computed statistics for an accepted friendship.
 *
 * @param {string} friendshipId - The UUID of the friendship.
 *
 * Response:
 * - netBalance: positive means the friend owes you, negative means you owe them.
 * - settledDebtCount: number of paid debts between the two users.
 * - longestOwed: the oldest pending debt (amount, currency, createdAt), or null if none.
 *
 * Access Control:
 * - Only participants of the friendship can view its stats.
 * - Only accepted friendships are valid.
 */
export const getFriendStats = async (req: Request, res: Response) => {
  try {
    const currentUser = res.locals.user!.id;
    const { id: friendshipId } = req.params;

    const friendship = await db.query.friendships.findFirst({
      where: and(
        eq(friendships.id, friendshipId as string),
        eq(friendships.status, 'accepted')
      ),
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship does not exist' });
    }

    if (
      currentUser !== friendship.userId1 &&
      currentUser !== friendship.userId2
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const friendId =
      currentUser === friendship.userId1
        ? friendship.userId2
        : friendship.userId1;

    const matchingDebts = await db
      .select()
      .from(debts)
      .where(
        and(
          isNull(debts.strangerName),
          or(eq(debts.lenderId, currentUser), eq(debts.lendeeId, currentUser)),
          or(eq(debts.lenderId, friendId), eq(debts.lendeeId, friendId)),
          ne(debts.status, 'void')
        )
      );

    const netBalance = matchingDebts
      .filter((d) => d.status === 'pending')
      .reduce(
        (acc, d) =>
          d.lendeeId === currentUser
            ? acc - parseFloat(d.amount)
            : acc + parseFloat(d.amount),
        0
      );

    const settledDebtCount = matchingDebts.filter(
      (d) => d.status === 'paid'
    ).length;

    const longestOwed = matchingDebts
      .filter((d) => d.status === 'pending')
      .reduce<(typeof matchingDebts)[0] | null>((oldest, d) => {
        if (!oldest) return d;
        return d.createdAt < oldest.createdAt ? d : oldest;
      }, null);

    const response = {
      netBalance,
      settledDebtCount,
      longestOwed: longestOwed
        ? {
            id: longestOwed.id,
            amount: parseFloat(longestOwed.amount),
            currency: longestOwed.currency,
            since: longestOwed.createdAt,
            direction:
              longestOwed.lendeeId === currentUser ? 'outgoing' : 'incoming',
          }
        : null,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const nudgeFriend = async (req: Request, res: Response) => {
  try {
    const { id: friendshipId } = req.params;
    const currentUser = res.locals.user!;

    const friendship = await db.query.friendships.findFirst({
      where: and(
        eq(friendships.id, friendshipId as string),
        eq(friendships.status, 'accepted'),
        or(
          eq(friendships.userId1, currentUser.id),
          eq(friendships.userId2, currentUser.id)
        )
      ),
    });

    if (!friendship)
      return res.status(404).json({ error: 'Friendship not found' });

    const targetUser = await db.query.users.findFirst({
      where: eq(
        users.id,
        friendship.userId1 === currentUser.id
          ? friendship.userId2
          : friendship.userId1
      ),
      columns: { id: true, email: true, firstName: true },
    });

    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const key = `nudge:cooldown:${targetUser.id}:${currentUser.id}`;

    try {
      const acquired = await redis.set(
        key,
        '1',
        'EX',
        NUDGE_COOLDOWN_SECONDS,
        'NX'
      );
      if (!acquired) {
        const ttl = await redis.ttl(key);
        res.setHeader('Retry-After', String(ttl));
        return res
          .status(429)
          .json({ error: 'Nudged too recently', retryAfter: ttl });
      }
    } catch (error) {
      console.error('Redis cooldown check failed, allowing nudge:', error);
    }

    const nudgeData = {
      from: {
        firstName: currentUser.firstName,
      },
    };

    try {
      await emailQueue.add('nudgeEmail', {
        to: targetUser.email,
        name: targetUser.firstName,
        nudgerName: `${currentUser.firstName} ${currentUser.lastName}`,
      });

      io.to(targetUser.id).emit('friendship:nudge', nudgeData);
    } catch (error) {
      // dispatch failed, clear the cooldown so the user can retry
      await redis.del(key).catch(() => {});
      console.error('Nudge dispatch failed, cleared cooldown:', error);
      return res.status(500).json({ error: 'Failed to send nudge' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

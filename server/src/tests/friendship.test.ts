import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lucia } from '../auth.js';
import { db } from '../db/index.js';
import { io } from '../socket.js';

// Mock database
vi.mock('../db/index.js', () => {
  const mockQueryBuilder = {
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    then: vi
      .fn()
      .mockImplementation((callback) =>
        callback([{ id: 'mock-friendship-id' }])
      ),
  };

  return {
    db: {
      select: vi.fn().mockReturnValue(mockQueryBuilder),
      update: vi.fn().mockReturnValue(mockQueryBuilder),
      delete: vi.fn().mockReturnValue(mockQueryBuilder),

      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'mock-friendship-id' }]),
        }),
      }),

      query: {
        friendships: {
          findFirst: vi.fn(),
        },
        users: {
          findFirst: vi.fn(),
        },
      },
    },
  };
});

vi.mock('../socket.js', () => ({
  io: {
    to: vi.fn().mockReturnValue({
      emit: vi.fn(),
    }),
  },
}));

vi.mock('../auth.js', () => ({
  lucia: {
    createSession: vi.fn(),
    createSessionCookie: vi.fn(),
    readSessionCookie: vi.fn(),
    validateSession: vi.fn(),
    invalidateSession: vi.fn(),
    createBlankSessionCookie: vi.fn(),
  },
}));

const { default: app } = await import('../app.js');
const { default: request } = await import('supertest');

const mockUserId = '00000000-0000-0000-0000-000000000000';

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(io.to).mockReturnValue({ emit: vi.fn() } as any);
  vi.mocked(lucia.readSessionCookie).mockReturnValue(
    'auth-session=mock-cookie'
  );
  vi.mocked(lucia.validateSession).mockResolvedValue({
    session: { id: 'mock-session-id', fresh: false } as any,
    user: { id: mockUserId, firstName: 'Alice', lastName: 'Smith' } as any,
  });
});

const createMockFriendship = (overrides = {}) => ({
  id: '11111111-1111-1111-1111-111111111111',
  ...overrides,
});

describe('GET /friendships', () => {
  it('should return 200 if friendships exist', async () => {
    const response = await request(app).get('/friendships');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'mock-friendship-id' }]);
  });

  it('should return 200 with type=pending filter', async () => {
    const response = await request(app).get('/friendships?type=pending');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return 500 on unexpected error', async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockRejectedValue(new Error('Unexpected')),
    } as any);

    const response = await request(app).get('/friendships');

    expect(response.status).toBe(500);
  });
});

describe('POST /friendships', () => {
  it('should return 400 if user tries to add themselves', async () => {
    const invalidFriendship = createMockFriendship({ id: mockUserId });
    const response = await request(app)
      .post('/friendships')
      .send(invalidFriendship);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Cannot add yourself');
  });

  it('should return 404 if user is not found', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

    const invalidFriendship = createMockFriendship();
    const response = await request(app)
      .post('/friendships')
      .send(invalidFriendship);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 201 if input is valid', async () => {
    const validFriendship = createMockFriendship();
    const [userId1, userId2] = [mockUserId, validFriendship.id].sort();

    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: validFriendship.id,
    } as any);

    const valuesSpy = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([
        {
          requesterId: mockUserId,
          userId1: userId1,
          userId2: userId2,
        },
      ]),
    });

    vi.mocked(db.insert).mockReturnValueOnce({
      values: valuesSpy,
    } as any);

    const response = await request(app)
      .post('/friendships')
      .send(validFriendship);

    expect(response.status).toBe(201);
    expect(valuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterId: mockUserId,
        userId1: userId1,
        userId2: userId2,
      })
    );
  });

  it('should return 500 on unexpected error', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: createMockFriendship().id,
    } as any);

    vi.mocked(db.insert).mockImplementationOnce(() => {
      throw new Error('Unexpected');
    });

    const response = await request(app)
      .post('/friendships')
      .send(createMockFriendship());

    expect(response.status).toBe(500);
  });

  it('should return 500 if db error code is unhandled', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: createMockFriendship().id,
    } as any);

    vi.mocked(db.insert).mockImplementationOnce(() => {
      throw { code: '99999' };
    });

    const response = await request(app)
      .post('/friendships')
      .send(createMockFriendship());

    expect(response.status).toBe(500);
  });

  it('should emit friendship:requested to target user', async () => {
    const validFriendship = createMockFriendship();

    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: validFriendship.id,
    } as any);

    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'mock-friendship-id' }]),
      }),
    } as any);

    await request(app).post('/friendships').send(validFriendship);

    expect(io.to).toHaveBeenCalledWith(validFriendship.id);
    expect(io.to(validFriendship.id).emit).toHaveBeenCalledWith(
      'friendship:requested',
      expect.objectContaining({ id: 'mock-friendship-id' })
    );
  });

  it('should return 409 if friendship already exists', async () => {
    const redundantFriendship = createMockFriendship();

    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: redundantFriendship.id,
    } as any);

    vi.mocked(db.insert).mockImplementationOnce(() => {
      throw { code: '23505' };
    });

    const response = await request(app)
      .post('/friendships')
      .send(redundantFriendship);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      'Friend request already exists or you are already friends'
    );
  });
});

describe('PATCH /friendships/:id', () => {
  it('should return 404 if friend request not found or unauthorized', async () => {
    const returnSpy = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    });

    vi.mocked(db.update).mockReturnValueOnce({ set: returnSpy } as any);

    const response = await request(app).patch('/friendships/12345');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Request not found or unauthorized');
  });

  it('should return 200 if input is valid', async () => {
    const setSpy = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'mock-friendship-id' }]),
      }),
    });

    vi.mocked(db.update).mockReturnValueOnce({ set: setSpy } as any);

    const response = await request(app)
      .patch('/friendships/12345')
      .send({ status: 'accepted' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'mock-friendship-id' });
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'accepted',
      })
    );
  });

  it('should emit friendship:accepted to requester', async () => {
    const mockRequesterId = '11111111-1111-1111-1111-111111111111';

    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: 'mock-friendship-id', requesterId: mockRequesterId },
          ]),
        }),
      }),
    } as any);

    await request(app).patch('/friendships/12345');

    expect(io.to).toHaveBeenCalledWith(mockRequesterId);
    expect(io.to(mockRequesterId).emit).toHaveBeenCalledWith(
      'friendship:accepted',
      expect.objectContaining({ id: 'mock-friendship-id' })
    );
  });

  it('should return 500 on unexpected error', async () => {
    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn().mockRejectedValue(new Error('Unexpected')),
    } as any);

    const response = await request(app).patch('/friendships/12345');

    expect(response.status).toBe(500);
  });
});

describe('DELETE /friendships/:id', () => {
  it('should return 404 if friend request not found or unauthorized', async () => {
    const returnSpy = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
    });

    vi.mocked(db.delete).mockReturnValueOnce({ where: returnSpy } as any);

    const response = await request(app).delete('/friendships/12345');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Request not found or unauthorized');
  });

  it('should return 204 if input is valid', async () => {
    const response = await request(app).delete('/friendships/12345');

    expect(response.status).toBe(204);
  });

  it('should emit friendship:deleted to other user', async () => {
    const otherUserId = '11111111-1111-1111-1111-111111111111';

    vi.mocked(db.delete).mockReturnValueOnce({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          { id: 'mock-friendship-id', userId1: mockUserId, userId2: otherUserId },
        ]),
      }),
    } as any);

    await request(app).delete('/friendships/12345');

    expect(io.to).toHaveBeenCalledWith(otherUserId);
    expect(io.to(otherUserId).emit).toHaveBeenCalledWith(
      'friendship:deleted',
      expect.objectContaining({ id: 'mock-friendship-id' })
    );
  });

  it('should return 500 on unexpected error', async () => {
    vi.mocked(db.delete).mockReturnValueOnce({
      where: vi.fn().mockRejectedValue(new Error('Unexpected')),
    } as any);

    const response = await request(app).delete('/friendships/12345');

    expect(response.status).toBe(500);
  });
});

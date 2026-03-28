import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lucia } from '../auth.js';
import { db } from '../db/index.js';

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
      .mockImplementation((callback) => callback([{ id: 'mock-user-id' }])),
  };

  return {
    db: {
      select: vi.fn().mockReturnValue(mockQueryBuilder),
      update: vi.fn().mockReturnValue(mockQueryBuilder),
      delete: vi.fn().mockReturnValue(mockQueryBuilder),

      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'mock-user-id' }]),
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

  vi.mocked(lucia.readSessionCookie).mockReturnValue(
    'auth-session=mock-cookie'
  );
  vi.mocked(lucia.validateSession).mockResolvedValue({
    session: { id: 'mock-session-id', fresh: false } as any,
    user: { id: mockUserId, firstName: 'Alice', lastName: 'Smith' } as any,
  });
});

describe('GET /users', () => {
  it('should return 200 if query returns a list of matching users', async () => {
    const response = await request(app).get('/users?q=alice');

    expect(response.status).toBe(200);
  });

  it('should return 200 if query returns an empty list when no users match', async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnValue({
        then: vi.fn().mockImplementation((callback) => callback([])),
      }),
    } as any);

    const response = await request(app).get('/users?q=alice');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 400 if query is less than 2 characters', async () => {
    const response = await request(app).get('/users?q=a');

    expect(response.status).toBe(400);
  });

  it('should return 400 if query is missing', async () => {
    const response = await request(app).get('/users?q=');

    expect(response.status).toBe(400);
  });

  it('should return 500 on unexpected error', async () => {
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockRejectedValue(new Error('Unexpected')),
    } as any);

    const response = await request(app).get('/users?q=alice');

    expect(response.status).toBe(500);
  });
});

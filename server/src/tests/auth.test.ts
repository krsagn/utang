import { eq } from 'drizzle-orm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { users } from '../db/schema.js';
import * as argon2 from 'argon2';
import { lucia } from '../auth.js';

// Mock database
vi.mock('../db/index.js', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ id: 'mock-user-id' }]),
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}));

// Mock Argon2 password hashing
vi.mock('argon2', () => ({
  hash: vi.fn().mockResolvedValue('mock-hashed-password'),
  verify: vi.fn().mockResolvedValue(true),
}));

// Mock Lucia Auth
vi.mock('../auth.js', () => ({
  lucia: {
    createSession: vi.fn().mockResolvedValue({ id: 'mock-session-id' }),
    createSessionCookie: vi.fn().mockReturnValue({
      serialize: () => 'auth_session=mock_cookie',
    }),
    readSessionCookie: vi.fn().mockReturnValue(null),
    validateSession: vi.fn().mockResolvedValue({ session: null, user: null }),
    invalidateSession: vi.fn(),
    createBlankSessionCookie: vi.fn().mockReturnValue({
      serialize: () => 'auth_session=blank-cookie',
    }),
  },
}));

const { default: app } = await import('../app.js');
const { default: request } = await import('supertest');

beforeEach(() => {
  vi.clearAllMocks();
});

const createMockUser = (overrides = {}) => ({
  email: 'alice@example.com',
  password: 'password123',
  username: 'alice_wonder',
  firstName: 'Alice',
  lastName: 'Smith',
  ...overrides,
});

describe('POST /auth/users', () => {
  it('should return 201 if input is valid', async () => {
    const validInput = createMockUser();
    const response = await request(app).post('/auth/users').send(validInput);

    expect(response.status).toBe(201);
  });

  it('should return 400 if input is invalid', async () => {
    const badInput = createMockUser({ email: 'not-an-email' });
    const response = await request(app).post('/auth/users').send(badInput);

    expect(response.status).toBe(400);
  });

  it('should return 409 if user already exists', async () => {
    const { db } = await import('../db/index.js');
    vi.mocked(db.insert).mockImplementationOnce(() => {
      throw { code: '23505' };
    });

    const input = createMockUser();
    const response = await request(app).post('/auth/users').send(input);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Email or username already exists');
  });

  it('should return 500 on unexpected error', async () => {
    const { db } = await import('../db/index.js');
    vi.mocked(db.insert).mockImplementationOnce(() => {
      throw new Error('Unexpected');
    });

    const response = await request(app).post('/auth/users').send(createMockUser());

    expect(response.status).toBe(500);
  });
});

describe('POST /auth/sessions', () => {
  it('should return 200 if input is valid', async () => {
    const { db } = await import('../db/index.js');
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: 'mock-user-id',
      email: 'alice@example.com',
      passwordHash: 'mock-hashed-password',
      username: 'alice_wonder',
      firstName: 'Alice',
      lastName: 'Smith',
      createdAt: new Date(),
    });

    const { email, password } = createMockUser();
    const response = await request(app)
      .post('/auth/sessions')
      .send({ email: email, password: password });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(email);
    expect(db.query.users.findFirst).toHaveBeenCalledWith({
      where: eq(users.email, 'alice@example.com'),
    });
  });

  it('should return 400 if input is invalid', async () => {
    const badInput = createMockUser({ email: 'not-an-email' });
    const response = await request(app).post('/auth/sessions').send(badInput);

    expect(response.status).toBe(400);
  });

  it('should return 400 if user does not exist', async () => {
    const { db } = await import('../db/index.js');
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

    const response = await request(app)
      .post('/auth/sessions')
      .send({ email: 'nobody@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid email or password');
  });

  it('should return 500 on unexpected error', async () => {
    const { db } = await import('../db/index.js');
    vi.mocked(db.query.users.findFirst).mockRejectedValueOnce(new Error('Unexpected'));

    const response = await request(app)
      .post('/auth/sessions')
      .send({ email: 'alice@example.com', password: 'password123' });

    expect(response.status).toBe(500);
  });

  it('should return 400 if password is wrong', async () => {
    const { db } = await import('../db/index.js');
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: 'mock-user-id',
      email: 'alice@example.com',
      passwordHash: 'mock-hashed-password',
      username: 'alice_wonder',
      firstName: 'Alice',
      lastName: 'Smith',
      createdAt: new Date(),
    });
    vi.mocked(argon2.verify).mockResolvedValueOnce(false);

    const { email, password } = createMockUser();
    const response = await request(app)
      .post('/auth/sessions')
      .send({ email: email, password: password });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid email or password');
    expect(argon2.verify).toHaveBeenCalledWith(
      'mock-hashed-password',
      password
    );
  });
});

describe('GET /auth/sessions/current', () => {
  it('should return 200 if no user is logged in', async () => {
    const response = await request(app).get('/auth/sessions/current');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: null });
  });

  it('should return 200 if user is logged in', async () => {
    vi.mocked(lucia.readSessionCookie).mockReturnValueOnce(
      'auth-session=mock-cookie'
    );
    vi.mocked(lucia.validateSession).mockResolvedValueOnce({
      session: { id: 'mock-session-id', fresh: false } as any,
      user: createMockUser({ id: 'mock-user-id' }) as any,
    });

    const response = await request(app).get('/auth/sessions/current');

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('alice@example.com');
  });
});

describe('DELETE /auth/sessions/current', () => {
  it('should return 401 if user is not logged in', async () => {
    const response = await request(app).delete('/auth/sessions/current');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Not logged in');
  });

  it('should return 200 if user is logged in', async () => {
    vi.mocked(lucia.readSessionCookie).mockReturnValueOnce(
      'auth-session=mock-cookie'
    );
    vi.mocked(lucia.validateSession).mockResolvedValueOnce({
      session: { id: 'mock-session-id', fresh: false } as any,
      user: createMockUser({ id: 'mock-user-id' }) as any,
    });

    const response = await request(app).delete('/auth/sessions/current');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logged out');
    expect(lucia.invalidateSession).toHaveBeenCalledWith('mock-session-id');
  });
});

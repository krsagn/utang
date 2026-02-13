import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../db/index.js', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn<any>().mockResolvedValue([{ id: 'mock-user-id' }]),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnValue([]),
  },
}));

jest.unstable_mockModule('argon2', () => ({
  hash: jest.fn<any>().mockResolvedValue('mock-hashed-password'),
  verify: jest.fn<any>().mockResolvedValue(true),
  default: {
    hash: jest.fn<any>().mockResolvedValue('mock-hashed-password'),
    verify: jest.fn<any>().mockResolvedValue(true),
  },
}));

jest.unstable_mockModule('../auth.js', () => ({
  lucia: {
    createSession: jest.fn<any>().mockResolvedValue({ id: 'mock-session-id' }),
    createSessionCookie: jest.fn<any>().mockReturnValue({
      serialize: () => 'auth_session=mock-cookie',
    }),
    readSessionCookie: jest.fn<any>().mockReturnValue(null),
    validateSession: jest
      .fn<any>()
      .mockResolvedValue({ session: null, user: null }),
    createBlankSessionCookie: jest.fn<any>().mockReturnValue({
      serialize: () => 'auth_session=blank-cookie',
    }),
  },
}));

const { default: app } = await import('../app.js');
const { default: request } = await import('supertest');

describe('POST /auth/users {Signup}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user and return 201', async () => {
    const response = await request(app).post('/auth/users').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'User created',
      user: {
        id: expect.any(String),
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies?.[0]).toContain('auth_session=mock-cookie');
  });

  it('should fail if email is invalid', async () => {
    const response = await request(app).post('/auth/users').send({
      email: 'invalid-email',
      password: '123',
      name: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should login an existing user', async () => {
    const mockUser = {
      id: 'existing-user-id',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      name: 'Existing User',
    };

    const { db } = await import('../db/index.js');
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn<any>().mockResolvedValue([mockUser]),
      }),
    });

    const response = await request(app).post('/auth/sessions').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: 'existing-user-id',
      email: 'test@example.com',
      name: 'Existing User',
    });

    expect(response.headers['set-cookie']).toBeDefined();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lucia } from '../auth.js';
import { db } from '../db/index.js';

// Mock database
vi.mock('../db/index.js', () => {
  const mockQueryBuilder = {
    from: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    then: vi
      .fn()
      .mockImplementation((callback) => callback([{ id: 'mock-debt-id' }])),
  };

  return {
    db: {
      select: vi.fn().mockReturnValue(mockQueryBuilder),
      update: vi.fn().mockReturnValue(mockQueryBuilder),
      delete: vi.fn().mockReturnValue(mockQueryBuilder),

      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'mock-debt-id' }]),
        }),
      }),

      query: {
        debts: {
          findFirst: vi.fn(),
        },
        users: {
          findFirst: vi.fn(),
        },
      },
    },
  };
});

vi.mock('../queues/emailQueue.js', () => ({
  emailQueue: { add: vi.fn().mockResolvedValue({}) },
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

  vi.mocked(lucia.readSessionCookie).mockReturnValue(
    'auth-session=mock-cookie'
  );
  vi.mocked(lucia.validateSession).mockResolvedValue({
    session: { id: 'mock-session-id', fresh: false } as any,
    user: { id: mockUserId, firstName: 'Alice', lastName: 'Smith' } as any,
  });
});

const createMockDebt = (overrides = {}) => ({
  lenderName: 'Alice',
  lendeeName: 'Bob',
  currency: 'USD',
  amount: '50.00',
  title: 'Mock Title',
  ...overrides,
});

describe('POST /debts', () => {
  it('should return 201 if input is valid', async () => {
    const validDebt = createMockDebt({ lenderId: mockUserId });
    const valuesSpy = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'mock-debt-id' }]),
    });

    vi.mocked(db.insert).mockReturnValueOnce({ values: valuesSpy } as any);

    const response = await request(app).post('/debts').send(validDebt);

    expect(response.status).toBe(201);
    expect(valuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...validDebt,
        amount: '50',
      })
    );
  });

  it('should return 403 if user is not involved in debt', async () => {
    const invalidDebt = createMockDebt();
    const response = await request(app).post('/debts').send(invalidDebt);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      'You cannot create a debt between two other people'
    );
  });

  it('should return 400 if input is invalid', async () => {
    const invalidDebt = createMockDebt({ lenderId: 'invalid-user-id' });
    const response = await request(app).post('/debts').send(invalidDebt);

    expect(response.status).toBe(400);
  });

  it('should return 500 if insert returns empty', async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    } as any);

    const response = await request(app)
      .post('/debts')
      .send(createMockDebt({ lenderId: mockUserId }));

    expect(response.status).toBe(500);
  });

  it('should return 400 if referenced user does not exist', async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({ code: '23503' }),
      }),
    } as any);

    const response = await request(app)
      .post('/debts')
      .send(createMockDebt({ lenderId: mockUserId }));

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Referenced user does not exist');
  });

  it('should return 409 on duplicate entry', async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({ code: '23505' }),
      }),
    } as any);

    const response = await request(app)
      .post('/debts')
      .send(createMockDebt({ lenderId: mockUserId }));

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Duplicate entry');
  });

  it('should queue an email if lender is a registered user', async () => {
    const { emailQueue } = await import('../queues/emailQueue.js');

    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: mockUserId,
      firstName: 'Alice',
      email: 'alice@example.com',
    } as any);

    const response = await request(app)
      .post('/debts')
      .send(createMockDebt({ lenderId: mockUserId }));

    expect(response.status).toBe(201);
    expect(emailQueue.add).toHaveBeenCalledTimes(1);
    expect(emailQueue.add).toHaveBeenCalledWith(
      'lenderCreationEmail',
      expect.objectContaining({
        to: 'alice@example.com',
        role: 'lender',
      })
    );
  });
});

describe('GET /debts', () => {
  it('should return 200 if debts exist', async () => {
    const response = await request(app).get('/debts');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'mock-debt-id' }]);
  });

  it('should return 200 when applying filters', async () => {
    const response = await request(app).get('/debts?type=pay&status=pending');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'mock-debt-id' }]);
  });
});

describe('PATCH /debts/:id', () => {
  it('should return 200 if input is valid', async () => {
    const setSpy = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'mock-debt-id' }]),
      }),
    });

    vi.mocked(db.update).mockReturnValueOnce({ set: setSpy } as any);

    const response = await request(app)
      .patch('/debts/12345')
      .send({ status: 'paid' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'mock-debt-id' });
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paid',
      })
    );
  });

  it('should return 400 if input is invalid', async () => {
    const response = await request(app)
      .patch('/debts/12345')
      .send({ status: 'wrong-status' });

    expect(response.status).toBe(400);
  });

  it('should return 404 if debt does not exist', async () => {
    const returnSpy = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    });

    vi.mocked(db.update).mockReturnValueOnce({ set: returnSpy } as any);

    const response = await request(app)
      .patch('/debts/12345')
      .send({ status: 'paid' });

    expect(response.status).toBe(404);
  });

  it('should refresh lender name if lenderId is provided', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: mockUserId,
      firstName: 'Alice',
      email: 'alice@example.com',
    } as any);

    const setSpy = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'mock-debt-id' }]),
      }),
    });

    vi.mocked(db.update).mockReturnValueOnce({ set: setSpy } as any);

    const response = await request(app)
      .patch('/debts/12345')
      .send({ lenderId: mockUserId });

    expect(response.status).toBe(200);
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({ lenderName: 'Alice' })
    );
  });

  it('should return 500 on unexpected error', async () => {
    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn().mockRejectedValue(new Error('Unexpected')),
    } as any);

    const response = await request(app)
      .patch('/debts/12345')
      .send({ status: 'paid' });

    expect(response.status).toBe(500);
  });
});

describe('DELETE /debts/:id', () => {
  it('should return 204 if debt is successfully deleted', async () => {
    const response = await request(app).delete('/debts/12345');

    expect(response.status).toBe(204);
  });

  it('should return 404 if debt does not exist', async () => {
    const returnSpy = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
    });

    vi.mocked(db.delete).mockReturnValueOnce({ where: returnSpy } as any);

    const response = await request(app).delete('/debts/12345');

    expect(response.status).toBe(404);
  });

  it('should return 500 on unexpected error', async () => {
    vi.mocked(db.delete).mockReturnValueOnce({
      where: vi.fn().mockRejectedValue(new Error('Unexpected')),
    } as any);

    const response = await request(app).delete('/debts/12345');

    expect(response.status).toBe(500);
  });
});

describe('GET /debts/:id', () => {
  it('should return 200 if debt exists', async () => {
    vi.mocked(db.query.debts.findFirst).mockResolvedValueOnce({
      id: 'mock-debt-id',
    } as any);
    const response = await request(app).get('/debts/12345');

    expect(response.status).toBe(200);
  });

  it('should return 404 if debt does not exist', async () => {
    const response = await request(app).get('/debts/12345');

    expect(response.status).toBe(404);
  });
});

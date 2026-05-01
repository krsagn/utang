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

vi.mock('../socket.js', () => ({
  io: {
    to: vi.fn().mockReturnValue({
      emit: vi.fn(),
    }),
  },
}));

const { default: app } = await import('../app.js');
const { default: request } = await import('supertest');

const mockUserId = '00000000-0000-0000-0000-000000000000';
const mockDebtId = '00000000-0000-0000-0000-000000000001';
const mockOtherPartyId = '11111111-1111-1111-1111-111111111111';
const mockEmit = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(io.to).mockReturnValue({ emit: mockEmit } as any);
  vi.mocked(lucia.readSessionCookie).mockReturnValue(
    'auth-session=mock-cookie'
  );
  vi.mocked(lucia.validateSession).mockResolvedValue({
    session: { id: 'mock-session-id', fresh: false } as any,
    user: { id: mockUserId, firstName: 'Alice', lastName: 'Smith' } as any,
  });
});

const createMockDebt = (overrides = {}) => ({
  type: 'receive',
  strangerName: 'Bob',
  currency: 'USD',
  amount: 50,
  title: 'Mock Title',
  ...overrides,
});

function mockFindDebt(overrides = {}) {
  vi.mocked(db.query.debts.findFirst).mockResolvedValueOnce({
    id: mockDebtId,
    lenderId: mockUserId,
    ...overrides,
  } as any);
}

function mockUpdateReturning(result: object[] = [{ id: 'mock-debt-id' }]) {
  const setSpy = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(result),
    }),
  });
  vi.mocked(db.update).mockReturnValueOnce({ set: setSpy } as any);
  return setSpy;
}

describe('POST /debts', () => {
  it('should return 201 if input is valid', async () => {
    const valuesSpy = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'mock-debt-id' }]),
    });

    vi.mocked(db.insert).mockReturnValueOnce({ values: valuesSpy } as any);

    const response = await request(app).post('/debts').send(createMockDebt());

    expect(response.status).toBe(201);
    // type='receive' → session user is lender
    expect(valuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        lenderId: mockUserId,
        strangerName: 'Bob',
        amount: '50',
      })
    );
  });

  it('should return 400 if input is invalid', async () => {
    // Both strangerName and otherPartyId are not allowed simultaneously
    const response = await request(app)
      .post('/debts')
      .send(createMockDebt({ otherPartyId: mockOtherPartyId }));

    expect(response.status).toBe(400);
  });

  it('should return 500 if insert returns empty', async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    } as any);

    const response = await request(app).post('/debts').send(createMockDebt());

    expect(response.status).toBe(500);
  });

  it('should return 400 if referenced user does not exist', async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({ code: '23503' }),
      }),
    } as any);

    const response = await request(app).post('/debts').send(createMockDebt());

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Referenced user does not exist');
  });

  it('should return 409 on duplicate entry', async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({ code: '23505' }),
      }),
    } as any);

    const response = await request(app).post('/debts').send(createMockDebt());

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Duplicate entry');
  });

  it('should return 201 if input is valid with type=pay (session user is lendee)', async () => {
    const valuesSpy = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'mock-debt-id' }]),
    });
    vi.mocked(db.insert).mockReturnValueOnce({ values: valuesSpy } as any);

    const response = await request(app)
      .post('/debts')
      .send(createMockDebt({ type: 'pay' }));

    expect(response.status).toBe(201);
    // type='pay' → session user is lendee
    expect(valuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        lendeeId: mockUserId,
        lenderId: null,
      })
    );
  });

  it('should queue an email if lender is a registered user', async () => {
    const { emailQueue } = await import('../queues/emailQueue.js');

    // type='receive' → session user (Alice) is the lender
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      id: mockUserId,
      firstName: 'Alice',
      email: 'alice@example.com',
    } as any);

    const response = await request(app).post('/debts').send(createMockDebt());

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

  it('should queue an email if lendee is a registered user', async () => {
    const { emailQueue } = await import('../queues/emailQueue.js');

    // type='pay' → session user (Alice) is the lendee; Bob (mockOtherPartyId) is the lender
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          { id: 'mock-debt-id', lenderId: mockOtherPartyId, lendeeId: mockUserId },
        ]),
      }),
    } as any);

    // Promise.all([lenderUser, lendeeUser]) → Bob has an email, Alice doesn't
    vi.mocked(db.query.users.findFirst)
      .mockResolvedValueOnce({ id: mockOtherPartyId, firstName: 'Bob', email: 'bob@example.com' } as any)
      .mockResolvedValueOnce(undefined);

    const response = await request(app)
      .post('/debts')
      .send({ type: 'pay', otherPartyId: mockOtherPartyId, currency: 'USD', amount: 50, title: 'Mock Title' });

    expect(response.status).toBe(201);
    expect(emailQueue.add).toHaveBeenCalledWith(
      'lenderCreationEmail',
      expect.objectContaining({
        to: 'bob@example.com',
        role: 'lender',
      })
    );
  });

  it('should return 500 on an unhandled db error code', async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue({ code: '99999' }),
      }),
    } as any);

    const response = await request(app).post('/debts').send(createMockDebt());

    expect(response.status).toBe(500);
  });

  it('should emit debt:created to lender and lendee', async () => {
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([
            { id: 'mock-debt-id', lenderId: mockUserId, lendeeId: mockOtherPartyId },
          ]),
      }),
    } as any);

    await request(app)
      .post('/debts')
      .send({ type: 'receive', otherPartyId: mockOtherPartyId, currency: 'USD', amount: 50, title: 'Mock Title' });

    expect(io.to).toHaveBeenCalledWith(mockUserId);
    expect(io.to).toHaveBeenCalledWith(mockOtherPartyId);
    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenCalledWith(
      'debt:created',
      expect.objectContaining({ id: 'mock-debt-id' })
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

  it('should return 200 when type=receive', async () => {
    const response = await request(app).get('/debts?type=receive');

    expect(response.status).toBe(200);
  });

  it('should return 200 when applying a search filter', async () => {
    const response = await request(app).get('/debts?search=Alice');

    expect(response.status).toBe(200);
  });

  it('should return 400 on an unrecognised query param', async () => {
    // getDebtsQuerySchema uses .strict(), so unknown params are rejected
    const response = await request(app).get('/debts?unknown=foo');

    expect(response.status).toBe(400);
  });
});

describe('PATCH /debts/:id', () => {
  it('should return 200 if input is valid', async () => {
    mockFindDebt();
    const setSpy = mockUpdateReturning();

    const response = await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ status: 'paid' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'mock-debt-id' });
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'paid' })
    );
  });

  it('should return 400 if the id is not a valid uuid', async () => {
    const response = await request(app)
      .patch('/debts/not-a-uuid')
      .send({ status: 'paid' });

    expect(response.status).toBe(400);
  });

  it('should return 400 if input is invalid', async () => {
    const response = await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ status: 'wrong-status' });

    expect(response.status).toBe(400);
  });

  it('should return 404 if debt does not exist', async () => {
    const response = await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ status: 'paid' });

    expect(response.status).toBe(404);
  });

  it('should return 400 if referenced user does not exist', async () => {
    mockFindDebt({ createdBy: mockUserId });
    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue({ code: '23503' }),
        }),
      }),
    } as any);

    const response = await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ otherPartyId: mockOtherPartyId });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Referenced user does not exist');
  });

  it('should return 404 if the update matches no rows', async () => {
    mockFindDebt({ createdBy: mockUserId });
    mockUpdateReturning([]);

    const response = await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ status: 'paid' });

    expect(response.status).toBe(404);
  });

  it('should return 500 on unexpected error', async () => {
    mockFindDebt();
    vi.mocked(db.update).mockReturnValueOnce({
      set: vi.fn().mockRejectedValue(new Error('Unexpected')),
    } as any);

    const response = await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ status: 'paid' });

    expect(response.status).toBe(500);
  });

  it('should null the other party ID when strangerName is provided', async () => {
    mockFindDebt({ createdBy: mockUserId });
    const setSpy = mockUpdateReturning();

    await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ strangerName: 'Charlie' });

    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({ lendeeId: null, strangerName: 'Charlie' })
    );
  });

  it('should null strangerName when otherPartyId is provided', async () => {
    mockFindDebt({ createdBy: mockUserId });
    const setSpy = mockUpdateReturning();

    await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ otherPartyId: mockOtherPartyId });

    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({ lendeeId: mockOtherPartyId, strangerName: null })
    );
  });

  it('should derive lenderId correctly when session user is the lendee', async () => {
    // debt.lenderId !== sessionUserId → session user is lendee
    mockFindDebt({ lenderId: mockOtherPartyId, createdBy: mockUserId });
    const setSpy = mockUpdateReturning();

    await request(app)
      .patch(`/debts/${mockDebtId}`)
      .send({ otherPartyId: mockOtherPartyId });

    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({ lendeeId: mockUserId, lenderId: mockOtherPartyId })
    );
  });

  it('should emit debt:updated to lender', async () => {
    mockFindDebt();
    mockUpdateReturning([{ id: 'mock-debt-id', lenderId: mockUserId }]);

    await request(app).patch(`/debts/${mockDebtId}`).send({ status: 'paid' });

    expect(io.to).toHaveBeenCalledWith(mockUserId);
    expect(mockEmit).toHaveBeenCalledWith(
      'debt:updated',
      expect.objectContaining({ id: 'mock-debt-id' })
    );
  });

  it('should emit debt:updated to lendee', async () => {
    mockFindDebt();
    mockUpdateReturning([{ id: 'mock-debt-id', lendeeId: mockOtherPartyId }]);

    await request(app).patch(`/debts/${mockDebtId}`).send({ status: 'paid' });

    expect(io.to).toHaveBeenCalledWith(mockOtherPartyId);
    expect(mockEmit).toHaveBeenCalledWith(
      'debt:updated',
      expect.objectContaining({ id: 'mock-debt-id' })
    );
  });
});

describe('DELETE /debts/:id', () => {
  it('should return 204 if debt is successfully deleted', async () => {
    const response = await request(app).delete(`/debts/${mockDebtId}`);

    expect(response.status).toBe(204);
  });

  it('should return 404 if debt does not exist', async () => {
    const returnSpy = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
    });

    vi.mocked(db.delete).mockReturnValueOnce({ where: returnSpy } as any);

    const response = await request(app).delete(`/debts/${mockDebtId}`);

    expect(response.status).toBe(404);
  });

  it('should return 500 on unexpected error', async () => {
    vi.mocked(db.delete).mockReturnValueOnce({
      where: vi.fn().mockRejectedValue(new Error('Unexpected')),
    } as any);

    const response = await request(app).delete(`/debts/${mockDebtId}`);

    expect(response.status).toBe(500);
  });

  it('should emit debt:deleted to lender', async () => {
    vi.mocked(db.delete).mockReturnValueOnce({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: 'mock-debt-id', lenderId: mockUserId }]),
      }),
    } as any);

    await request(app).delete(`/debts/${mockDebtId}`);

    expect(io.to).toHaveBeenCalledWith(mockUserId);
    expect(mockEmit).toHaveBeenCalledWith(
      'debt:deleted',
      expect.objectContaining({ id: 'mock-debt-id' })
    );
  });

  it('should emit debt:deleted to lendee', async () => {
    vi.mocked(db.delete).mockReturnValueOnce({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: 'mock-debt-id', lendeeId: mockOtherPartyId }]),
      }),
    } as any);

    await request(app).delete(`/debts/${mockDebtId}`);

    expect(io.to).toHaveBeenCalledWith(mockOtherPartyId);
    expect(mockEmit).toHaveBeenCalledWith(
      'debt:deleted',
      expect.objectContaining({ id: 'mock-debt-id' })
    );
  });
});

describe('GET /debts/:id', () => {
  it('should return 200 if debt exists', async () => {
    const response = await request(app).get(`/debts/${mockDebtId}`);

    expect(response.status).toBe(200);
  });

  it('should return 400 if the id is not a valid uuid', async () => {
    const response = await request(app).get('/debts/not-a-uuid');

    expect(response.status).toBe(400);
  });

  it('should return 404 if debt does not exist', async () => {
    const emptyBuilder = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((callback) => callback([])),
    };
    vi.mocked(db.select).mockReturnValueOnce(emptyBuilder as any);

    const response = await request(app).get(`/debts/${mockDebtId}`);

    expect(response.status).toBe(404);
  });

  it('should return 500 on unexpected error', async () => {
    const errorBuilder = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((_resolve: unknown, reject: (e: unknown) => void) =>
        reject(new Error('Unexpected'))
      ),
    };
    vi.mocked(db.select).mockReturnValueOnce(errorBuilder as any);

    const response = await request(app).get(`/debts/${mockDebtId}`);

    expect(response.status).toBe(500);
  });
});

import { Redis } from 'ioredis';

export const createRedisConnection = () => {
  const retryMin = parseInt(process.env.REDIS_RETRY_MIN_MS ?? '1000', 10) || 1000;
  const retryMax = parseInt(process.env.REDIS_RETRY_MAX_MS ?? '20000', 10) || 20000;

  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => Math.max(Math.min(Math.exp(times), retryMax), retryMin),
  });
};

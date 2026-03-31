import { Redis } from 'ioredis';

export const createRedisConnection = () =>
  new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => Math.max(Math.min(Math.exp(times), 20000), 1000),
  });

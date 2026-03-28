import { Queue } from 'bullmq';
import { createRedisConnection } from '../db/redis.js';

export const emailQueue = new Queue('emailQueue', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

import { Worker, Job } from 'bullmq';
import { Resend } from 'resend';
import { createRedisConnection } from '../db/redis.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailWorker = new Worker(
  'emailQueue',
  async (job: Job) => {
    const { to, name, amount, currency } = job.data;
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: to,
      subject: 'New debt created!',
      html: `<p>Hi ${name}, a debt of ${currency} ${amount} was created.</p>`,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }
  },
  { connection: createRedisConnection() }
);

emailWorker.on('completed', (job) =>
  console.log(`Email job ${job.id} completed`)
);
emailWorker.on('failed', (job, err) =>
  console.error(`Email job ${job?.id} failed:`, err)
);

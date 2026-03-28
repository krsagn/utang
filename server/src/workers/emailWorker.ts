import { Worker, Job } from 'bullmq';
import { Resend } from 'resend';
import { createRedisConnection } from '../db/redis.js';
import { debtCreatedEmail } from '../emails/debtCreatedEmail.js';

if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
  console.error('Missing required env vars: RESEND_API_KEY and EMAIL_FROM must be set');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

const emailWorker = new Worker(
  'emailQueue',
  async (job: Job) => {
    const { to, name, amount, currency, otherPartyName, title, role } =
      job.data;
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: 'New debt created!',
      html: debtCreatedEmail(
        name,
        amount,
        currency,
        otherPartyName,
        title,
        role
      ),
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

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from '../../node_modules/@types/pg/index.js';
import * as schema from './schema.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

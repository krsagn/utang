import { db } from '../src/db/index.js';
import { users, sessions, debts } from '../src/db/schema.js';
import { sql } from 'drizzle-orm';

async function reset() {
  console.log('🗑️  Deleting all data...');

  // Delete in order to respect foreign key constraints
  try {
    await db.delete(debts); // Debts reference Users
    await db.delete(sessions); // Sessions reference Users
    await db.delete(users); // Users are referenced by others

    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to reset database:', err);
    process.exit(1);
  }
}

reset();

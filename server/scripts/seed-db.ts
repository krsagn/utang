import { db } from '../src/db/index.js';
import { users, debts } from '../src/db/schema.js';
import * as argon2 from 'argon2';

async function seed() {
  console.log('Seeding database...');

  try {
    // 1. Create Users
    console.log('Creating users...');
    const hashedPassword = await argon2.hash('password123'); // Default password for everyone

    const user1Id = crypto.randomUUID();
    const user2Id = crypto.randomUUID();

    await db.insert(users).values({
      id: user1Id,
      username: 'kristian',
      email: 'kristian@example.com',
      firstName: 'Kristian',
      lastName: 'Example',
      passwordHash: hashedPassword,
    });
    console.log('Created Kristian');

    await db.insert(users).values({
      id: user2Id,
      username: 'romina',
      email: 'romina@example.com',
      firstName: 'Romina',
      lastName: 'Friend',
      passwordHash: hashedPassword,
    });
    console.log('Created Romina');

    // 2. Create Debts
    console.log('Creating debts...');
    await db.insert(debts).values({
      title: 'Lunch at McDo',
      amount: '150.00',
      currency: 'PHP',
      lenderId: user2Id, // Romina
      lenderName: 'Romina',
      lendeeId: user1Id, // Kristian
      lendeeName: 'Kristian',
      createdBy: user1Id, // Kristian created this record
    });

    await db.insert(debts).values({
      title: 'Cinema Tickets',
      amount: '300.00',
      currency: 'PHP',
      lenderId: user1Id, // Kristian
      lenderName: 'Kristian',
      lendeeId: user2Id, // Romina
      lendeeName: 'Romina',
      createdBy: user1Id, // Kristian created this too
    });

    await db.insert(debts).values({
      title: 'Grab Share',
      amount: '85.50',
      currency: 'PHP',
      lenderId: user2Id,
      lenderName: 'Romina',
      lendeeId: user1Id,
      lendeeName: 'Kristian',
      createdBy: user2Id, // Romina created this one
    });

    console.log('✅ Database seeded successfully!');
    console.log(`User 1 (Kristian): ${user1Id}`);
    console.log(`User 2 (Romina): ${user2Id}`);
    console.log('Password for all: password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed database:', err);
    process.exit(1);
  }
}

seed();

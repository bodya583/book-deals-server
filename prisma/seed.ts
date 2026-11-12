import { PrismaClient } from '@prisma/client';
import { SEED_GENRES, SEED_USERS_WITH_HASH, SEED_BOOKS_1000 } from '../src/mocks/catalog/seed1000Data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting BookSwap Database Seed ---');

  console.log('1. Clearing old trades, messages, books, users, genres...');
  await prisma.tradeMessage.deleteMany({});
  await prisma.tradeItem.deleteMany({});
  await prisma.trade.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.genre.deleteMany({});
  console.log('✓ Old data cleared.');

  console.log(`2. Seeding ${SEED_GENRES.length} genres...`);
  await prisma.genre.createMany({
    data: SEED_GENRES.map((g) => ({
      id: g.id,
      name: g.name,
    })),
    skipDuplicates: true,
  });
  console.log(`✓ ${SEED_GENRES.length} genres created.`);

  console.log(`3. Seeding ${SEED_USERS_WITH_HASH.length} users with residential house coordinates...`);
  await prisma.user.createMany({
    data: SEED_USERS_WITH_HASH.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      password: u.password,
      photoURL: u.photoURL,
      city: u.city,
      latitude: u.latitude,
      longitude: u.longitude,
    })),
    skipDuplicates: true,
  });
  console.log(`✓ ${SEED_USERS_WITH_HASH.length} users created.`);

  console.log(`4. Seeding ${SEED_BOOKS_1000.length} authentic books in batches...`);
  const BATCH_SIZE = 50;

  for (let i = 0; i < SEED_BOOKS_1000.length; i += BATCH_SIZE) {
    const batch = SEED_BOOKS_1000.slice(i, i + BATCH_SIZE);

    await prisma.$transaction(
      batch.map((b) =>
        prisma.book.create({
          data: {
            id: b.id,
            title: b.title,
            author: b.author,
            description: b.description,
            coverURL: b.coverURL,
            language: b.language,
            year: b.year,
            userId: b.userId,
            isForTrade: b.isForTrade ?? true,
            genres: {
              connect: b.genres.map((g) => ({ id: g.id })),
            },
          },
        })
      )
    );

    const progress = Math.min(i + BATCH_SIZE, SEED_BOOKS_1000.length);
    console.log(`  Seeded ${progress} / ${SEED_BOOKS_1000.length} books...`);
  }

  console.log('✓ All 1000 books successfully seeded into database!');
  console.log('✓ No trades created (clean slate for user trades).');
  console.log('--- Database Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

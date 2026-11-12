import { prisma } from '../index.js';
import { isMockMode } from '../config/env.js';
import { getMockGenres, createMockGenre } from '../mocks/mockBooks.js';

export const DEFAULT_GENRES = [
  'Fiction',
  'Sci-Fi',
  'Fantasy',
  'Mystery / Detective',
  'Thriller / Horror',
  'Adventure',
  'Romance / Novel',
  'Classic Literature',
  'Non-fiction',
  'Biography / Memoir',
  'History',
  'Psychology / Self-help',
  'Business / Finance',
  'Philosophy',
  'Poetry',
  'Children’s Literature',
  'Computer Science / IT',
];

export const getAllGenres = async () => {
  if (isMockMode) {
    return getMockGenres();
  }

  const existing = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      _count: {
        select: { books: true },
      },
    },
  });

  if (existing.length > 0) {
    return existing;
  }

  await prisma.genre.createMany({
    data: DEFAULT_GENRES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  return prisma.genre.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      _count: {
        select: { books: true },
      },
    },
  });
};

export const createGenre = async (name: string) => {
  if (isMockMode) {
    return createMockGenre(name);
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Genre name cannot be empty');
  }

  return prisma.genre.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
    select: {
      id: true,
      name: true,
    },
  });
};

import { prisma } from '../index.js';
import { isMockMode } from '../config/env.js';
import { getMockGenres, createMockGenre } from '../mocks/mockBooks.js';

export const DEFAULT_GENRES = [
  'Художественная литература',
  'Фантастика',
  'Фэнтези',
  'Детектив',
  'Триллер / Ужасы',
  'Приключения',
  'Роман / Проза',
  'Классическая литература',
  'Научная литература',
  'Биография / Мемуары',
  'История',
  'Психология / Саморазвитие',
  'Бизнес / Финансы',
  'Философия',
  'Поэзия',
  'Детская литература',
  'Компьютерные технологии / IT',
];

export const getAllGenres = async () => {
  if (isMockMode) {
    return getMockGenres();
  }

  const count = await prisma.genre.count();
  if (count === 0) {
    await prisma.genre.createMany({
      data: DEFAULT_GENRES.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

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
    throw new Error('Название жанра не может быть пустым');
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

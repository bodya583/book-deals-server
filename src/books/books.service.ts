import { prisma } from '../index.js';
import { isMockMode } from '../config/env.js';
import {
  getAllMockBooks,
  getMockBookById,
  getMockBookDetails,
  createMockBook,
  updateMockBook,
  deleteMockBook,
  getMockSettlements,
} from '../mocks/mockBooks.js';
import {
  bookSelect,
  buildBookOrderBy,
  buildBookWhereClause,
  fetchPaginatedPrismaBooks,
  resolveNearbyUserIds,
} from './books.query.js';
import type {
  BookSortOption,
  CreateBookDto,
  GetBooksFilter,
  UpdateBookDto,
} from './books.types.js';

export type { BookSortOption, CreateBookDto, GetBooksFilter, UpdateBookDto };

export const getAllBooks = async (filter?: GetBooksFilter) => {
  if (isMockMode) {
    return getAllMockBooks(filter);
  }

  const page = Math.max(1, Number(filter?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filter?.limit) || 12));
  const where = buildBookWhereClause(filter);
  const orderBy = buildBookOrderBy(filter?.sortBy);

  const hasProximity =
    typeof filter?.nearLat === 'number' && typeof filter?.nearLng === 'number';

  if (hasProximity) {
    const nearbyUserIds = await resolveNearbyUserIds(
      filter!.nearLat!,
      filter!.nearLng!,
      filter?.radius
    );

    if (
      nearbyUserIds.length === 0 ||
      (filter?.userId && !nearbyUserIds.includes(filter.userId))
    ) {
      return {
        books: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    if (!filter?.userId) {
      where.userId = { in: nearbyUserIds };
    }
  }

  return fetchPaginatedPrismaBooks(where, orderBy, page, limit);
};

export const getBookById = async (id: string) => {
  if (isMockMode) {
    return getMockBookById(id);
  }

  const book = await prisma.book.findUnique({
    where: { id },
    select: bookSelect,
  });

  if (!book) {
    throw new Error('Book not found');
  }

  return book;
};

export const getFullBookDetails = async (id: string) => {
  if (isMockMode) {
    return getMockBookDetails(id);
  }

  const book = await getBookById(id);
  const moreByAuthor = await prisma.book.findMany({
    where: { author: book.author, id: { not: book.id } },
    take: 4,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      author: true,
      coverURL: true,
      language: true,
      year: true,
      genres: { select: { id: true, name: true } },
      createdAt: true,
    },
  });

  return { ...book, moreByAuthor };
};

export const createBook = async (data: CreateBookDto) => {
  if (isMockMode) {
    return createMockBook(data, data.userId);
  }

  if (!data.title || !data.author) {
    throw new Error('Title and author are required');
  }

  const cleanGenres = Array.isArray(data.genres)
    ? data.genres.map((g) => g.trim()).filter(Boolean)
    : [];

  return prisma.book.create({
    data: {
      title: data.title.trim(),
      author: data.author.trim(),
      description: data.description?.trim(),
      coverURL: data.coverURL?.trim(),
      language: data.language?.trim() || null,
      year: typeof data.year === 'number' && !isNaN(data.year) ? data.year : null,
      userId: data.userId || null,
      isForTrade: data.isForTrade !== undefined ? data.isForTrade : true,
      ...(cleanGenres.length > 0 && {
        genres: {
          connectOrCreate: cleanGenres.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      }),
    },
    select: bookSelect,
  });
};

export const updateBook = async (id: string, data: UpdateBookDto) => {
  if (isMockMode) {
    return updateMockBook(id, data, data.userId);
  }

  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Book not found');
  }

  let genresUpdate;
  if (data.genres !== undefined) {
    const cleanGenres = Array.isArray(data.genres)
      ? data.genres.map((g) => g.trim()).filter(Boolean)
      : [];

    genresUpdate = {
      set: [],
      connectOrCreate: cleanGenres.map((name) => ({
        where: { name },
        create: { name },
      })),
    };
  }

  return prisma.book.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.author !== undefined && { author: data.author.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() }),
      ...(data.coverURL !== undefined && { coverURL: data.coverURL?.trim() }),
      ...(data.language !== undefined && { language: data.language?.trim() || null }),
      ...(data.year !== undefined && {
        year: typeof data.year === 'number' && !isNaN(data.year) ? data.year : null,
      }),
      ...(data.userId !== undefined && { userId: data.userId }),
      ...(data.isForTrade !== undefined && { isForTrade: data.isForTrade }),
      ...(genresUpdate && { genres: genresUpdate }),
    },
    select: bookSelect,
  });
};

export const deleteBook = async (id: string) => {
  if (isMockMode) {
    return deleteMockBook(id);
  }

  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Book not found');
  }

  return prisma.book.delete({ where: { id } });
};

export const getSettlements = async () => {
  if (isMockMode) {
    return getMockSettlements();
  }

  try {
    return await prisma.$queryRaw<{ name: string; count: number; latitude: number; longitude: number }[]>`
      SELECT
        COALESCE(u.city, 'Unspecified') as name,
        COUNT(b.id)::int as count,
        AVG(u.latitude)::float as latitude,
        AVG(u.longitude)::float as longitude
      FROM "User" u
      JOIN "Book" b ON b."userId" = u.id
      WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL
      GROUP BY COALESCE(u.city, 'Unspecified')
      ORDER BY count DESC
    `;
  } catch {
    return [];
  }
};

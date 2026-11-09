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

export interface CreateBookDto {
  title: string;
  author: string;
  description?: string;
  coverURL?: string;
  language?: string;
  year?: number | null;
  genres?: string[];
  userId?: string;
  isForTrade?: boolean;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  description?: string;
  coverURL?: string;
  language?: string;
  year?: number | null;
  genres?: string[];
  userId?: string;
  isForTrade?: boolean;
}

export type BookSortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'distance' | 'popular';

export interface GetBooksFilter {
  search?: string;
  userId?: string;
  isForTrade?: boolean;
  genre?: string;
  genres?: string[];
  strictGenres?: boolean;
  language?: string;
  languages?: string[];
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  limit?: number;
  sortBy?: BookSortOption;
  // Proximity filter — uses PostGIS spherical distance (geography)
  nearLat?: number;
  nearLng?: number;
  radius?: number; // km
  // Settlement filter
  city?: string;
  cities?: string[];
}

const bookSelect = {
  id: true,
  title: true,
  author: true,
  description: true,
  coverURL: true,
  language: true,
  year: true,
  genres: {
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc' as const,
    },
  },
  userId: true,
  isForTrade: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      username: true,
      photoURL: true,
      city: true,
    },
  },
};

export const getAllBooks = async (filter?: GetBooksFilter) => {
  if (isMockMode) {
    return getAllMockBooks(filter);
  }

  const page = Math.max(1, Number(filter?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filter?.limit) || 12));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filter?.userId) {
    where.userId = filter.userId;
  }

  if (filter?.isForTrade !== undefined) {
    where.isForTrade = filter.isForTrade;
  }

  // Settlements / Cities filter
  const cityList = filter?.cities && filter.cities.length > 0
    ? filter.cities
    : filter?.city && filter.city !== 'all'
      ? [filter.city]
      : [];

  if (cityList.length > 0) {
    where.user = {
      ...(where.user || {}),
      city: { in: cityList, mode: 'insensitive' },
    };
  }

  // Languages filter (multi-select)
  const langs = filter?.languages && filter.languages.length > 0
    ? filter.languages
    : filter?.language && filter.language !== 'all'
      ? [filter.language]
      : [];

  if (langs.length > 0) {
    where.language = { in: langs };
  }

  // Genres filter (multi-select with strict AND vs OR match)
  const genreList = filter?.genres && filter.genres.length > 0
    ? filter.genres
    : filter?.genre && filter.genre !== 'all'
      ? [filter.genre]
      : [];

  const isUuid = (val: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  if (genreList.length > 0) {
    if (filter?.strictGenres) {
      // Strict match: book must have ALL of the selected genres (1 AND 2 AND 3)
      where.AND = [
        ...(where.AND || []),
        ...genreList.map((gName) => ({
          genres: {
            some: isUuid(gName)
              ? { id: gName }
              : { name: { equals: gName, mode: 'insensitive' } },
          },
        })),
      ];
    } else {
      // Lenient match: book has ANY of the selected genres (1 OR 2 OR 3)
      where.genres = {
        some: {
          OR: genreList.map((gName) =>
            isUuid(gName)
              ? { id: gName }
              : { name: { equals: gName, mode: 'insensitive' } }
          ),
        },
      };
    }
  }

  // Year filter (year, yearFrom, yearTo)
  if (filter?.year !== undefined && !isNaN(filter.year)) {
    where.year = filter.year;
  } else if (
    (filter?.yearFrom !== undefined && !isNaN(filter.yearFrom)) ||
    (filter?.yearTo !== undefined && !isNaN(filter.yearTo))
  ) {
    where.year = {};
    if (filter.yearFrom !== undefined && !isNaN(filter.yearFrom)) {
      where.year.gte = filter.yearFrom;
    }
    if (filter.yearTo !== undefined && !isNaN(filter.yearTo)) {
      where.year.lte = filter.yearTo;
    }
  }

  if (filter?.search && filter.search.trim()) {
    const s = filter.search.trim();
    where.OR = [
      { title: { contains: s, mode: 'insensitive' } },
      { author: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { genres: { some: { name: { contains: s, mode: 'insensitive' } } } },
    ];
  }

  // ---------- Proximity filter via PostGIS geography (spherical earth) ----------
  const hasProximity =
    filter?.nearLat !== undefined &&
    filter?.nearLng !== undefined &&
    typeof filter.nearLat === 'number' &&
    typeof filter.nearLng === 'number';

  if (hasProximity) {
    const lat = filter!.nearLat!;
    const lng = filter!.nearLng!;
    const radiusKm = typeof filter!.radius === 'number' && filter!.radius > 0
      ? filter!.radius
      : 50; // default 50 km
    const radiusM = radiusKm * 1000;

    // Build WHERE clause from existing Prisma where object as SQL fragments
    // We use a raw query that joins Book → User and filters by distance
    const prismaWhere = where;

    // Collect userId ids of users within radius via raw SQL
    const nearbyUsers = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "User"
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusM}
        )
    `;

    const nearbyUserIds = nearbyUsers.map((u) => u.id);

    // Add userId filter to existing where clause
    if (nearbyUserIds.length === 0) {
      return {
        books: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    // Dynamic orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (filter?.sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (filter?.sortBy === 'title_asc') {
      orderBy = { title: 'asc' };
    } else if (filter?.sortBy === 'title_desc') {
      orderBy = { title: 'desc' };
    } else if (filter?.sortBy === 'popular') {
      orderBy = [{ tradeItems: { _count: 'desc' } }, { createdAt: 'desc' }];
    }

    const [total, books] = await Promise.all([
      prisma.book.count({ where: prismaWhere }),
      prisma.book.findMany({
        where: prismaWhere,
        skip,
        take: limit,
        orderBy,
        select: bookSelect,
      }),
    ]);

    return {
      books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  // ---------- End proximity filter ----------

  // Dynamic orderBy
  let orderBy: any = { createdAt: 'desc' };
  if (filter?.sortBy === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (filter?.sortBy === 'title_asc') {
    orderBy = { title: 'asc' };
  } else if (filter?.sortBy === 'title_desc') {
    orderBy = { title: 'desc' };
  } else if (filter?.sortBy === 'popular') {
    orderBy = [{ tradeItems: { _count: 'desc' } }, { createdAt: 'desc' }];
  }

  const [total, books] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: bookSelect,
    }),
  ]);

  return {
    books,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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
    where: {
      author: book.author,
      id: { not: book.id },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      author: true,
      coverURL: true,
      language: true,
      year: true,
      genres: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  return {
    ...book,
    moreByAuthor,
  };
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

  return prisma.book.delete({
    where: { id },
  });
};

export const getSettlements = async () => {
  if (isMockMode) {
    return getMockSettlements();
  }

  try {
    const list = await prisma.$queryRaw<{ name: string; count: number; latitude: number; longitude: number }[]>`
      SELECT 
        COALESCE(u.city, 'Не указан') as name,
        COUNT(b.id)::int as count,
        AVG(u.latitude)::float as latitude,
        AVG(u.longitude)::float as longitude
      FROM "User" u
      JOIN "Book" b ON b."userId" = u.id
      WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL
      GROUP BY COALESCE(u.city, 'Не указан')
      ORDER BY count DESC
    `;
    return list;
  } catch {
    return [];
  }
};
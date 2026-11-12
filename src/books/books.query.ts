import { prisma } from '../index.js';
import type { BookSortOption, GetBooksFilter } from './books.types.js';

type BookFindManyArgs = NonNullable<Parameters<typeof prisma.book.findMany>[0]>;
export type BookWhereInput = NonNullable<BookFindManyArgs['where']>;
export type BookOrderByInput = NonNullable<BookFindManyArgs['orderBy']>;

export const bookSelect = {
  id: true,
  title: true,
  author: true,
  description: true,
  coverURL: true,
  language: true,
  year: true,
  genres: {
    select: { id: true, name: true },
    orderBy: { name: 'asc' as const },
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
      latitude: true,
      longitude: true,
    },
  },
};

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const normalizeFilterList = (items?: string[], single?: string): string[] => {
  if (items && items.length > 0) return items;
  if (single && single !== 'all') return [single];
  return [];
};

export const buildBookWhereClause = (filter?: GetBooksFilter): BookWhereInput => {
  const where: BookWhereInput = {};

  if (filter?.userId) where.userId = filter.userId;
  if (filter?.isForTrade !== undefined) {
    where.isForTrade = filter.isForTrade;
  } else if (!filter?.userId) {
    where.isForTrade = true;
  }

  const cityList = normalizeFilterList(filter?.cities, filter?.city);
  if (cityList.length > 0) {
    const hasUnspecified = cityList.some((c) => c.toLowerCase() === 'unspecified');
    const namedCities = cityList.filter((c) => c.toLowerCase() !== 'unspecified');

    if (hasUnspecified && namedCities.length > 0) {
      where.user = {
        OR: [{ city: { in: namedCities, mode: 'insensitive' } }, { city: null }],
      };
    } else if (hasUnspecified) {
      where.user = { city: null };
    } else {
      where.user = { city: { in: namedCities, mode: 'insensitive' } };
    }
  }

  const langs = normalizeFilterList(filter?.languages, filter?.language);
  if (langs.length > 0) {
    where.language = { in: langs };
  }

  const genreList = normalizeFilterList(filter?.genres, filter?.genre);
  if (genreList.length > 0) {
    if (filter?.strictGenres) {
      const andClauses = genreList.map((gName) => ({
        genres: {
          some: isUuid(gName)
            ? { id: gName }
            : { name: { equals: gName, mode: 'insensitive' as const } },
        },
      }));
      where.AND = Array.isArray(where.AND) ? [...where.AND, ...andClauses] : andClauses;
    } else {
      where.genres = {
        some: {
          OR: genreList.map((gName) =>
            isUuid(gName)
              ? { id: gName }
              : { name: { equals: gName, mode: 'insensitive' as const } }
          ),
        },
      };
    }
  }

  if (filter?.year !== undefined && !isNaN(filter.year)) {
    where.year = filter.year;
  } else if (
    (filter?.yearFrom !== undefined && !isNaN(filter.yearFrom)) ||
    (filter?.yearTo !== undefined && !isNaN(filter.yearTo))
  ) {
    where.year = {
      ...(filter.yearFrom !== undefined && !isNaN(filter.yearFrom) ? { gte: filter.yearFrom } : {}),
      ...(filter.yearTo !== undefined && !isNaN(filter.yearTo) ? { lte: filter.yearTo } : {}),
    };
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

  return where;
};

export const buildBookOrderBy = (sortBy?: BookSortOption): BookOrderByInput => {
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'title_asc':
      return { title: 'asc' };
    case 'title_desc':
      return { title: 'desc' };
    case 'popular':
      return [{ tradeItems: { _count: 'desc' } }, { createdAt: 'desc' }];
    default:
      return { createdAt: 'desc' };
  }
};

export const resolveNearbyUserIds = async (
  lat: number,
  lng: number,
  radiusKm?: number
): Promise<string[]> => {
  const effectiveRadiusKm = typeof radiusKm === 'number' && radiusKm > 0 ? radiusKm : 50;
  const radiusM = effectiveRadiusKm * 1000;

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

  return nearbyUsers.map((u) => u.id);
};

export const fetchPaginatedPrismaBooks = async (
  where: BookWhereInput,
  orderBy: BookOrderByInput,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  if (page === 1) {
    const rows = await prisma.book.findMany({
      where,
      skip: 0,
      take: limit + 1,
      orderBy,
      select: bookSelect,
    });
    if (rows.length <= limit) {
      return {
        books: rows,
        pagination: {
          total: rows.length,
          page,
          limit,
          totalPages: rows.length > 0 ? 1 : 0,
        },
      };
    }
    const total = await prisma.book.count({ where });
    return {
      books: rows.slice(0, limit),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

import { randomUUID } from 'crypto';
import type { CreateBookDto, UpdateBookDto, GetBooksFilter } from '../books/books.types.js';
import { calculateDistanceKm } from '../utils/geoPrivacy.js';
import { MOCK_USERS } from './mockUsers.js';
import { countMockGenres, findGenre } from './mockGenres.js';
import type { MockBook, MockSettlement, MockUser } from './mockBooks.types.js';
import { SEED_BOOKS_1000 } from './catalog/seed1000Data.js';

export const inMemoryBooks: MockBook[] = SEED_BOOKS_1000.map((b) => {
  if (b.userId === '00000000-0000-4000-a000-000000000001') {
    return {
      ...b,
      userId: 'u-1',
      user: { ...b.user!, id: 'u-1' },
    };
  }
  return b;
});

const sanitizeUser = (user?: MockUser | null) =>
  user
    ? {
        id: user.id,
        username: user.username,
        photoURL: user.photoURL ?? null,
        city: user.city ?? null,
        latitude: user.latitude ?? null,
        longitude: user.longitude ?? null,
      }
    : null;

export const getAllMockBooks = async (filter?: GetBooksFilter) => {
  let list = [...inMemoryBooks];

  if (filter?.userId) list = list.filter((b) => b.userId === filter.userId);
  if (filter?.isForTrade !== undefined) {
    list = list.filter((b) => (b.isForTrade ?? true) === filter.isForTrade);
  } else if (!filter?.userId) {
    list = list.filter((b) => b.isForTrade !== false);
  }

  const cityList = filter?.cities?.length
    ? filter.cities.map((c) => c.toLowerCase().trim())
    : filter?.city && filter.city !== 'all'
    ? [filter.city.toLowerCase().trim()]
    : [];

  if (cityList.length > 0) {
    const matchingUserIds = new Set(
      MOCK_USERS.filter((u) => u.city && cityList.includes(u.city.toLowerCase().trim())).map((u) => u.id)
    );
    list = list.filter((b) => b.userId && matchingUserIds.has(b.userId));
  }

  if (typeof filter?.nearLat === 'number' && typeof filter?.nearLng === 'number') {
    const radiusKm = typeof filter.radius === 'number' && filter.radius > 0 ? filter.radius : 50;
    const nearbyUserIds = new Set(
      MOCK_USERS.filter(
        (u) =>
          u.latitude != null &&
          u.longitude != null &&
          calculateDistanceKm(filter.nearLat!, filter.nearLng!, u.latitude, u.longitude) <= radiusKm
      ).map((u) => u.id)
    );
    list = list.filter((b) => b.userId && nearbyUserIds.has(b.userId));
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
    );
  }

  const langs = filter?.languages?.length
    ? filter.languages
    : filter?.language && filter.language !== 'all'
    ? [filter.language]
    : [];
  if (langs.length > 0) {
    list = list.filter((b) => b.language && langs.includes(b.language));
  }

  const genreList = filter?.genres?.length
    ? filter.genres
    : filter?.genre && filter.genre !== 'all'
    ? [filter.genre]
    : [];
  if (genreList.length > 0) {
    list = list.filter((b) => {
      const names = b.genres.map((g) => g.name.toLowerCase());
      return filter?.strictGenres
        ? genreList.every((req) => names.includes(req.toLowerCase()))
        : genreList.some((req) => names.includes(req.toLowerCase()));
    });
  }

  if (filter?.year !== undefined && !isNaN(filter.year)) {
    list = list.filter((b) => b.year === filter.year);
  } else {
    if (filter?.yearFrom !== undefined && !isNaN(filter.yearFrom)) {
      list = list.filter((b) => b.year !== null && b.year >= filter.yearFrom!);
    }
    if (filter?.yearTo !== undefined && !isNaN(filter.yearTo)) {
      list = list.filter((b) => b.year !== null && b.year <= filter.yearTo!);
    }
  }

  const sortBy = filter?.sortBy || 'newest';
  if (sortBy === 'oldest') {
    list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else if (sortBy === 'title_asc') {
    list.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
  } else if (sortBy === 'title_desc') {
    list.sort((a, b) => b.title.localeCompare(a.title, 'en', { sensitivity: 'base' }));
  } else if (sortBy === 'popular') {
    const score = (book: MockBook) =>
      ((parseInt(book.id.replace(/\D/g, '') || '0', 10) * 17) % 100) + (book.genres?.length || 0) * 15;
    list.sort((a, b) => score(b) - score(a));
  } else if (sortBy === 'distance' && filter?.nearLat != null && filter?.nearLng != null) {
    const dist = (b: MockBook) =>
      b.user?.latitude != null && b.user?.longitude != null
        ? calculateDistanceKm(filter.nearLat!, filter.nearLng!, b.user.latitude, b.user.longitude)
        : Infinity;
    list.sort((a, b) => dist(a) - dist(b));
  } else {
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const page = Math.max(1, Number(filter?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filter?.limit) || 12));
  const skip = (page - 1) * limit;
  const total = list.length;

  return {
    books: list.slice(skip, skip + limit).map((b) => ({ ...b, user: sanitizeUser(b.user) })),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
};

export const getMockBookById = async (id: string) => {
  const book = inMemoryBooks.find((b) => b.id === id);
  if (!book) throw new Error('Book not found');
  return { ...book, user: sanitizeUser(book.user) };
};

export const getMockBookDetails = async (id: string) => {
  const book = await getMockBookById(id);
  const moreByAuthor = inMemoryBooks
    .filter((b) => b.id !== book.id && b.author.toLowerCase().trim() === book.author.toLowerCase().trim())
    .slice(0, 4)
    .map(({ id: bid, title, author, coverURL, language, year, genres, createdAt }) => ({
      id: bid, title, author, coverURL, language, year, genres, createdAt,
    }));
  return { ...book, moreByAuthor };
};

export const createMockBook = async (data: CreateBookDto, userId?: string) => {
  const newBook: MockBook = {
    id: randomUUID(),
    title: data.title.trim(),
    author: data.author.trim(),
    description: data.description?.trim() || null,
    coverURL: data.coverURL?.trim() || null,
    language: data.language?.trim() || null,
    year: data.year || null,
    genres: (data.genres || []).map((name) => findGenre(name)),
    userId: userId || 'u-1',
    isForTrade: data.isForTrade !== undefined ? data.isForTrade : true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: MOCK_USERS.find((u) => u.id === userId) || (userId ? { id: userId, username: 'me' } : null),
  };
  inMemoryBooks.unshift(newBook);
  return newBook;
};

export const updateMockBook = async (id: string, data: UpdateBookDto, _userId?: string) => {
  const index = inMemoryBooks.findIndex((b) => b.id === id);
  if (index === -1) throw new Error('Book not found');

  const current = inMemoryBooks[index];
  const updated: MockBook = {
    ...current,
    title: data.title !== undefined ? data.title.trim() : current.title,
    author: data.author !== undefined ? data.author.trim() : current.author,
    description: data.description !== undefined ? data.description.trim() || null : current.description,
    coverURL: data.coverURL !== undefined ? data.coverURL.trim() || null : current.coverURL,
    language: data.language !== undefined ? data.language.trim() || null : current.language,
    year: data.year !== undefined ? data.year : current.year,
    genres: data.genres ? data.genres.map((name) => findGenre(name)) : current.genres,
    isForTrade: data.isForTrade !== undefined ? data.isForTrade : (current.isForTrade ?? true),
    updatedAt: new Date(),
  };
  inMemoryBooks[index] = updated;
  return updated;
};

export const deleteMockBook = async (id: string, _userId?: string) => {
  const index = inMemoryBooks.findIndex((b) => b.id === id);
  if (index === -1) throw new Error('Book not found');
  return inMemoryBooks.splice(index, 1)[0];
};

export const getMockGenres = async () => countMockGenres(inMemoryBooks);

export const getMockSettlements = async (): Promise<MockSettlement[]> => {
  const map = new Map<string, MockSettlement>();
  for (const user of MOCK_USERS) {
    if (!user.city || user.latitude == null || user.longitude == null) continue;
    const count = inMemoryBooks.filter((b) => b.userId === user.id && b.isForTrade !== false).length;
    const existing = map.get(user.city);
    if (existing) {
      existing.count += count;
    } else {
      map.set(user.city, { name: user.city, count, latitude: user.latitude, longitude: user.longitude });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

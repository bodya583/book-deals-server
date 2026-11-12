import { randomUUID } from 'crypto';
import type { MockBook, MockGenre } from './mockBooks.types.js';

export const MOCK_GENRES: MockGenre[] = [
  { id: 'g-1', name: 'Fiction' },
  { id: 'g-2', name: 'Sci-Fi' },
  { id: 'g-3', name: 'Fantasy' },
  { id: 'g-4', name: 'Mystery / Detective' },
  { id: 'g-5', name: 'Thriller / Horror' },
  { id: 'g-6', name: 'Adventure' },
  { id: 'g-7', name: 'Romance / Novel' },
  { id: 'g-8', name: 'Classic Literature' },
  { id: 'g-9', name: 'Popular Science' },
  { id: 'g-10', name: 'Biography / Memoir' },
  { id: 'g-11', name: 'History' },
  { id: 'g-12', name: 'Psychology / Self-help' },
  { id: 'g-13', name: 'Business / Finance' },
  { id: 'g-14', name: 'Philosophy' },
  { id: 'g-15', name: 'Poetry' },
  { id: 'g-16', name: 'Children’s Literature' },
  { id: 'g-17', name: 'Computer Science / IT' },
  { id: 'g-18', name: 'Young Adult' },
  { id: 'g-19', name: 'Comics & Manga' },
  { id: 'g-20', name: 'Art & Design' },
  { id: 'g-21', name: 'Education & Languages' },
  { id: 'g-22', name: 'Hobbies & Travel' },
];

export const findGenre = (name: string): MockGenre => {
  const found = MOCK_GENRES.find((g) => g.name.toLowerCase() === name.toLowerCase());
  return found || { id: randomUUID(), name };
};

export const countMockGenres = (books: MockBook[]) =>
  MOCK_GENRES.map((g) => ({
    ...g,
    _count: {
      books: books.filter((b) => b.genres.some((bg) => bg.name === g.name)).length,
    },
  }));

export const createMockGenre = async (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Genre name cannot be empty');
  }
  let existing = MOCK_GENRES.find((g) => g.name.toLowerCase() === trimmed.toLowerCase());
  if (!existing) {
    existing = { id: `g-${Date.now()}`, name: trimmed };
    MOCK_GENRES.push(existing);
  }
  return existing;
};

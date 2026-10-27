import { Request, Response } from 'express';
import * as booksService from './books.service.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const {
      search,
      userId,
      genre,
      genres,
      strictGenres,
      language,
      languages,
      year,
      yearFrom,
      yearTo,
      page,
      limit,
      nearLat,
      nearLng,
      radius,
      city,
      cities,
      isForTrade,
    } = req.query;

    // Parse genres: can be string[] or comma-separated string or single genre
    let parsedGenres: string[] | undefined;
    if (Array.isArray(genres)) {
      parsedGenres = genres.map(String).filter(Boolean);
    } else if (typeof genres === 'string' && genres.trim()) {
      parsedGenres = genres.split(',').map((g) => g.trim()).filter(Boolean);
    } else if (typeof genre === 'string' && genre.trim() && genre !== 'all') {
      parsedGenres = [genre.trim()];
    }

    // Parse languages: can be string[] or comma-separated string or single language
    let parsedLanguages: string[] | undefined;
    if (Array.isArray(languages)) {
      parsedLanguages = languages.map(String).filter(Boolean);
    } else if (typeof languages === 'string' && languages.trim()) {
      parsedLanguages = languages.split(',').map((l) => l.trim()).filter(Boolean);
    } else if (typeof language === 'string' && language.trim() && language !== 'all') {
      parsedLanguages = [language.trim()];
    }

    // Parse settlements / cities: can be string[] or comma-separated string
    let parsedCities: string[] | undefined;
    if (Array.isArray(cities)) {
      parsedCities = cities.map(String).filter(Boolean);
    } else if (typeof cities === 'string' && cities.trim()) {
      parsedCities = cities.split(',').map((c) => c.trim()).filter(Boolean);
    } else if (typeof city === 'string' && city.trim() && city !== 'all') {
      parsedCities = [city.trim()];
    }

    const isStrictGenres = String(strictGenres) === 'true';

    const parsedNearLat = nearLat !== undefined && !isNaN(Number(nearLat)) ? Number(nearLat) : undefined;
    const parsedNearLng = nearLng !== undefined && !isNaN(Number(nearLng)) ? Number(nearLng) : undefined;
    const parsedRadius = radius !== undefined && !isNaN(Number(radius)) ? Number(radius) : undefined;

    const result = await booksService.getAllBooks({
      search: typeof search === 'string' ? search : undefined,
      userId: typeof userId === 'string' ? userId : undefined,
      isForTrade: isForTrade !== undefined ? String(isForTrade) === 'true' : undefined,
      genres: parsedGenres,
      strictGenres: isStrictGenres,
      languages: parsedLanguages,
      cities: parsedCities,
      year: year !== undefined && !isNaN(Number(year)) ? Number(year) : undefined,
      yearFrom: yearFrom !== undefined && !isNaN(Number(yearFrom)) ? Number(yearFrom) : undefined,
      yearTo: yearTo !== undefined && !isNaN(Number(yearTo)) ? Number(yearTo) : undefined,
      page: typeof page === 'string' ? Number(page) : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
      nearLat: parsedNearLat,
      nearLng: parsedNearLng,
      radius: parsedRadius,
    });

    return res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching books';
    return res.status(500).json({ message });
  }
};

export const getSettlements = async (_req: Request, res: Response) => {
  try {
    const list = await booksService.getSettlements();
    return res.status(200).json(list);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching settlements';
    return res.status(500).json({ message });
  }
};


export const getById = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : undefined;

    if (!id) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    const book = await booksService.getBookById(id);
    return res.status(200).json(book);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching book';
    const status = message === 'Book not found' ? 404 : 500;
    return res.status(status).json({ message });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : undefined;

    if (!id) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    const bookDetails = await booksService.getFullBookDetails(id);
    return res.status(200).json(bookDetails);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching book details';
    const status = message === 'Book not found' ? 404 : 500;
    return res.status(status).json({ message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    // userId comes from the verified JWT token, not from the request body
    const userId = req.user!.userId;
    const { title, author, description, coverURL, language, year, genres } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }

    const book = await booksService.createBook({
      title,
      author,
      description,
      coverURL,
      language,
      year: year !== undefined && year !== '' && !isNaN(Number(year)) ? Number(year) : null,
      genres: Array.isArray(genres) ? genres : undefined,
      userId,
    });

    return res.status(201).json(book);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating book';
    return res.status(400).json({ message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : undefined;
    const userId = req.user!.userId;

    if (!id) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    // Verify the book belongs to the requesting user
    const existing = await booksService.getBookById(id);
    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: you do not own this book' });
    }

    const { title, author, description, coverURL, language, year, genres, isForTrade } = req.body;

    const book = await booksService.updateBook(id, {
      title,
      author,
      description,
      coverURL,
      language,
      year: year !== undefined ? (year !== '' && year !== null && !isNaN(Number(year)) ? Number(year) : null) : undefined,
      genres: Array.isArray(genres) ? genres : undefined,
      isForTrade: typeof isForTrade === 'boolean' ? isForTrade : undefined,
    });

    return res.status(200).json(book);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating book';
    const status = message === 'Book not found' ? 404 : 400;
    return res.status(status).json({ message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : undefined;
    const userId = req.user!.userId;

    if (!id) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    // Verify the book belongs to the requesting user
    const existing = await booksService.getBookById(id);
    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: you do not own this book' });
    }

    await booksService.deleteBook(id);
    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting book';
    const status = message === 'Book not found' ? 404 : 500;
    return res.status(status).json({ message });
  }
};

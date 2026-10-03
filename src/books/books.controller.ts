import { Request, Response } from 'express';
import * as booksService from './books.service.js';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { search, userId, page, limit } = req.query;

    const result = await booksService.getAllBooks({
      search: typeof search === 'string' ? search : undefined,
      userId: typeof userId === 'string' ? userId : undefined,
      page: typeof page === 'string' ? Number(page) : undefined,
      limit: typeof limit === 'string' ? Number(limit) : undefined,
    });

    return res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching books';
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
    const { title, author, description, coverURL, userId } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }

    const book = await booksService.createBook({
      title,
      author,
      description,
      coverURL,
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
    const { title, author, description, coverURL, userId } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    const book = await booksService.updateBook(id, {
      title,
      author,
      description,
      coverURL,
      userId,
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

    if (!id) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    await booksService.deleteBook(id);
    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting book';
    const status = message === 'Book not found' ? 404 : 500;
    return res.status(status).json({ message });
  }
};
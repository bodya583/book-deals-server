import { Request, Response } from 'express';
import * as genresService from './genres.service.js';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const genres = await genresService.getAllGenres();
    return res.status(200).json(genres);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching genres';
    return res.status(500).json({ message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Название жанра обязательно' });
    }

    const genre = await genresService.createGenre(name);
    return res.status(201).json(genre);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating genre';
    return res.status(400).json({ message });
  }
};

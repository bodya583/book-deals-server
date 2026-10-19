import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import authRouter from './auth/auth.router.js';
import booksRouter from './books/books.router.js';
import genresRouter from './genres/genres.router.js';
import uploadRouter from './upload/upload.router.js';
import { isMockMode } from './config/env.js';

const connString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString: connString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/genres', genresRouter);
app.use('/api/upload', uploadRouter);

app.listen(PORT, () => {
  console.log(`Server run -> http://localhost:${PORT}`);
  if (isMockMode) {
    console.log(`[MOCK MODE] 🚀 Сервер запущен с демонстрационными книгами (база данных не затрагивается)`);
  }
});
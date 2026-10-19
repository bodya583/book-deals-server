import { prisma } from '../index.js';

export interface CreateBookDto {
  title: string;
  author: string;
  description?: string;
  coverURL?: string;
  userId?: string;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  description?: string;
  coverURL?: string;
  userId?: string;
}

export interface GetBooksFilter {
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
}


export const getAllBooks = async (filter?: GetBooksFilter) => {
  const page = Math.max(1, Number(filter?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filter?.limit) || 20));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filter?.userId) {
    where.userId = filter.userId;
  }

  if (filter?.search) {
    where.OR = [
      { title: { contains: filter.search, mode: 'insensitive' } },
      { author: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  const [total, books] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        coverURL: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            photoURL: true,
          },
        },
      },
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
  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      coverURL: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          photoURL: true,
        },
      },
    },
  });

  if (!book) {
    throw new Error('Book not found');
  }

  return book;
};

export const getFullBookDetails = async (id: string) => {
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
      createdAt: true,
    },
  });

  return {
    ...book,
    moreByAuthor,
  };
};

export const createBook = async (data: CreateBookDto) => {
  if (!data.title || !data.author) {
    throw new Error('Title and author are required');
  }

  return prisma.book.create({
    data: {
      title: data.title.trim(),
      author: data.author.trim(),
      description: data.description?.trim(),
      coverURL: data.coverURL?.trim(),
      userId: data.userId || null,
    },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      coverURL: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          photoURL: true,
        },
      },
    },
  });
};

export const updateBook = async (id: string, data: UpdateBookDto) => {
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Book not found');
  }

  return prisma.book.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.author !== undefined && { author: data.author.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() }),
      ...(data.coverURL !== undefined && { coverURL: data.coverURL?.trim() }),
      ...(data.userId !== undefined && { userId: data.userId }),
    },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      coverURL: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          photoURL: true,
        },
      },
    },
  });
};

export const deleteBook = async (id: string) => {
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Book not found');
  }

  return prisma.book.delete({
    where: { id },
  });
};
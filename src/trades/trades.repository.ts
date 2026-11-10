import { prisma } from '../index.js';
import { inMemoryTradeMessages, MockTrade } from '../mocks/mockTrades.js';

export interface FormattedBook {
  id: string;
  title: string;
  author: string;
  coverURL: string | null;
  language: string | null;
  year: number | null;
  userId: string | null;
  genres?: { id: string; name: string }[];
}

export interface FormattedPartner {
  id: string;
  username: string;
  photoURL?: string | null;
  city?: string | null;
  bookCount?: number;
}

export interface FormattedTrade {
  id: string;
  senderId: string;
  sender: FormattedPartner;
  receiverId: string;
  receiver: FormattedPartner;
  status: string;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  offeredBooks: FormattedBook[];
  requestedBooks: FormattedBook[];
  items: unknown[];
  isSender: boolean;
  isReceiver: boolean;
  senderCompleted: boolean;
  receiverCompleted: boolean;
  agreedLocationHash?: string;
  agreedTimeHash?: string;
  messagesCount: number;
}

export const bookInclude = {
  select: {
    id: true,
    title: true,
    author: true,
    coverURL: true,
    language: true,
    year: true,
    userId: true,
    genres: {
      select: { id: true, name: true },
    },
  },
};

export const userSelect = {
  select: {
    id: true,
    username: true,
    photoURL: true,
    city: true,
  },
};

interface PrismaTradeItemWithBook {
  id: string;
  bookId: string;
  side: 'OFFERED' | 'REQUESTED';
  book: FormattedBook;
}

export interface PrismaTradeEntity {
  id: string;
  senderId: string;
  sender: FormattedPartner;
  receiverId: string;
  receiver: FormattedPartner;
  status: string;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: PrismaTradeItemWithBook[];
  senderCompleted?: boolean;
  receiverCompleted?: boolean;
  _count?: { messages: number };
  messages?: { id: string }[];
}

export const formatTradePrisma = (
  trade: PrismaTradeEntity,
  currentUserId: string
): FormattedTrade => {
  const offeredBooks = trade.items
    .filter((item) => item.side === 'OFFERED')
    .map((item) => item.book);

  const requestedBooks = trade.items
    .filter((item) => item.side === 'REQUESTED')
    .map((item) => item.book);

  return {
    id: trade.id,
    senderId: trade.senderId,
    sender: trade.sender,
    receiverId: trade.receiverId,
    receiver: trade.receiver,
    status: trade.status,
    message: trade.message,
    createdAt: trade.createdAt,
    updatedAt: trade.updatedAt,
    offeredBooks,
    requestedBooks,
    items: trade.items,
    isSender: trade.senderId === currentUserId,
    isReceiver: trade.receiverId === currentUserId,
    senderCompleted: Boolean(trade.senderCompleted),
    receiverCompleted: Boolean(trade.receiverCompleted),
    messagesCount: trade._count?.messages ?? trade.messages?.length ?? 0,
  };
};

export const formatTradeMock = (
  trade: MockTrade,
  currentUserId: string
): FormattedTrade => {
  const offeredBooks = trade.items
    .filter((item) => item.side === 'OFFERED')
    .map((item) => item.book as FormattedBook);

  const requestedBooks = trade.items
    .filter((item) => item.side === 'REQUESTED')
    .map((item) => item.book as FormattedBook);

  const messagesCount = inMemoryTradeMessages.filter((m) => m.tradeId === trade.id).length;

  return {
    id: trade.id,
    senderId: trade.senderId,
    sender: trade.sender,
    receiverId: trade.receiverId,
    receiver: trade.receiver,
    status: trade.status,
    message: trade.message,
    createdAt: trade.createdAt,
    updatedAt: trade.updatedAt,
    offeredBooks,
    requestedBooks,
    items: trade.items,
    isSender: trade.senderId === currentUserId,
    isReceiver: trade.receiverId === currentUserId,
    senderCompleted: Boolean(trade.senderCompleted),
    receiverCompleted: Boolean(trade.receiverCompleted),
    agreedLocationHash: trade.agreedLocationHash,
    agreedTimeHash: trade.agreedTimeHash,
    messagesCount,
  };
};

export const findPrismaTradeById = async (tradeId: string): Promise<PrismaTradeEntity | null> => {
  return (await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      sender: userSelect,
      receiver: userSelect,
      items: {
        include: {
          book: bookInclude,
        },
      },
    },
  })) as unknown as PrismaTradeEntity | null;
};

export const findPrismaBooksByIds = async (bookIds: string[]) => {
  return await prisma.book.findMany({
    where: { id: { in: bookIds } },
    select: {
      id: true,
      userId: true,
      isForTrade: true,
    },
  });
};

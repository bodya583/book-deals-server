import { randomUUID } from 'crypto';
import { prisma } from '../index.js';
import { isMockMode } from '../config/env.js';
import { inMemoryBooks, MOCK_USERS } from '../mocks/mockBooks.js';
import {
  inMemoryTrades,
  ensureMockTradesForUser,
  findUser,
  MockTrade,
  inMemoryTradeMessages,
  MockTradeMessage,
} from '../mocks/mockTrades.js';

export interface CreateTradeDto {
  receiverId: string;
  offerBookIds: string[];
  targetBookIds: string[];
  message?: string;
}

export interface TradeFilter {
  tab?: 'incoming' | 'outgoing' | 'agreed' | 'completed' | 'all';
}

const bookInclude = {
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

const userSelect = {
  select: {
    id: true,
    username: true,
    photoURL: true,
    city: true,
  },
};

const formatTradePrisma = (trade: any, currentUserId: string) => {
  const offeredBooks = trade.items
    .filter((item: any) => item.side === 'OFFERED')
    .map((item: any) => item.book);

  const requestedBooks = trade.items
    .filter((item: any) => item.side === 'REQUESTED')
    .map((item: any) => item.book);

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
    senderCompleted: Boolean((trade as any).senderCompleted),
    receiverCompleted: Boolean((trade as any).receiverCompleted),
  };
};

const formatTradeMock = (trade: MockTrade, currentUserId: string) => {
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
  };
};

export const getTrades = async (userId: string, filter?: TradeFilter) => {
  if (isMockMode) {
    ensureMockTradesForUser(userId);
    let list = inMemoryTrades.filter(
      (t) => t.senderId === userId || t.receiverId === userId
    );

    const tab = filter?.tab || 'all';

    if (tab === 'incoming') {
      list = list.filter((t) => t.receiverId === userId && t.status === 'PENDING');
    } else if (tab === 'outgoing') {
      list = list.filter((t) => t.senderId === userId && t.status === 'PENDING');
    } else if (tab === 'agreed') {
      list = list.filter((t) => ['AGREED', 'ACCEPTED'].includes(t.status));
    } else if (tab === 'completed') {
      list = list.filter((t) => t.status === 'COMPLETED');
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.map((t) => formatTradeMock(t, userId));
  }

  const tab = filter?.tab || 'all';
  let where: any = {};

  if (tab === 'incoming') {
    where = { receiverId: userId, status: 'PENDING' };
  } else if (tab === 'outgoing') {
    where = { senderId: userId, status: 'PENDING' };
  } else if (tab === 'agreed') {
    where = {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: { in: ['AGREED', 'ACCEPTED'] },
    };
  } else if (tab === 'completed') {
    where = {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: 'COMPLETED',
    };
  } else {
    where = {
      OR: [{ senderId: userId }, { receiverId: userId }],
    };
  }

  const trades = await prisma.trade.findMany({
    where,
    include: {
      sender: userSelect,
      receiver: userSelect,
      items: {
        include: {
          book: bookInclude,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return trades.map((t) => formatTradePrisma(t, userId));
};

export const getTradeCounts = async (userId: string) => {
  if (isMockMode) {
    ensureMockTradesForUser(userId);
    const userTrades = inMemoryTrades.filter(
      (t) => t.senderId === userId || t.receiverId === userId
    );

    const incoming = userTrades.filter(
      (t) => t.receiverId === userId && t.status === 'PENDING'
    ).length;

    const outgoing = userTrades.filter(
      (t) => t.senderId === userId && t.status === 'PENDING'
    ).length;

    const agreed = userTrades.filter(
      (t) => ['AGREED', 'ACCEPTED'].includes(t.status)
    ).length;

    const completed = userTrades.filter(
      (t) => t.status === 'COMPLETED'
    ).length;

    return { incoming, outgoing, agreed, completed, total: userTrades.length };
  }

  const [incoming, outgoing, agreed, completed, total] = await Promise.all([
    prisma.trade.count({
      where: { receiverId: userId, status: 'PENDING' },
    }),
    prisma.trade.count({
      where: { senderId: userId, status: 'PENDING' },
    }),
    prisma.trade.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: { in: ['AGREED', 'ACCEPTED'] },
      },
    }),
    prisma.trade.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'COMPLETED',
      },
    }),
    prisma.trade.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    }),
  ]);

  return { incoming, outgoing, agreed, completed, total };
};

export const getTradeById = async (tradeId: string, userId: string) => {
  if (isMockMode) {
    ensureMockTradesForUser(userId);
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) {
      throw new Error('Трейд не найден');
    }
    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new Error('У вас нет доступа к этому трейду');
    }
    return formatTradeMock(trade, userId);
  }

  const trade = await prisma.trade.findUnique({
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
  });

  if (!trade) {
    throw new Error('Трейд не найден');
  }

  if (trade.senderId !== userId && trade.receiverId !== userId) {
    throw new Error('У вас нет доступа к этому трейду');
  }

  return formatTradePrisma(trade, userId);
};

export const createTrade = async (senderId: string, data: CreateTradeDto) => {
  const { receiverId, offerBookIds = [], targetBookIds = [], message } = data;

  if (!receiverId) {
    throw new Error('Не указан партнер по обмену');
  }

  if (receiverId === senderId) {
    throw new Error('Нельзя создать трейд с самим собой');
  }

  if (offerBookIds.length === 0 && targetBookIds.length === 0) {
    throw new Error('Выберите хотя бы одну книгу для предложения или запроса');
  }

  if (isMockMode) {
    ensureMockTradesForUser(senderId);

    const sender = findUser(senderId, 'Вы');
    const receiver = findUser(receiverId, 'Партнер');

    // Find books in memory
    const offeredBooks = inMemoryBooks.filter((b) => offerBookIds.includes(b.id));
    const targetBooks = inMemoryBooks.filter((b) => targetBookIds.includes(b.id));

    const items = [
      ...offeredBooks.map((b) => ({
        id: randomUUID(),
        bookId: b.id,
        side: 'OFFERED' as const,
        book: b,
      })),
      ...targetBooks.map((b) => ({
        id: randomUUID(),
        bookId: b.id,
        side: 'REQUESTED' as const,
        book: b,
      })),
    ];

    const newTrade: MockTrade = {
      id: randomUUID(),
      senderId,
      sender,
      receiverId,
      receiver,
      status: 'PENDING',
      message: message?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items,
    };

    if (message?.trim()) {
      inMemoryTradeMessages.push({
        id: randomUUID(),
        tradeId: newTrade.id,
        senderId,
        sender,
        text: message.trim(),
        createdAt: new Date(),
      });
    }

    inMemoryTrades.unshift(newTrade);
    return formatTradeMock(newTrade, senderId);
  }

  // Database mode
  return await prisma.$transaction(async (tx) => {
    const newTrade = await tx.trade.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
        message: message?.trim() || null,
        items: {
          create: [
            ...offerBookIds.map((bookId) => ({
              bookId,
              side: 'OFFERED' as const,
            })),
            ...targetBookIds.map((bookId) => ({
              bookId,
              side: 'REQUESTED' as const,
            })),
          ],
        },
      },
      include: {
        sender: userSelect,
        receiver: userSelect,
        items: {
          include: {
            book: bookInclude,
          },
        },
      },
    });

    if (message?.trim()) {
      await tx.tradeMessage.create({
        data: {
          tradeId: newTrade.id,
          senderId,
          text: message.trim(),
        },
      });
    }

    return formatTradePrisma(newTrade, senderId);
  });
};

export const acceptTrade = async (tradeId: string, userId: string) => {
  if (isMockMode) {
    const tradeIndex = inMemoryTrades.findIndex((t) => t.id === tradeId);
    if (tradeIndex === -1) {
      throw new Error('Трейд не найден');
    }

    const trade = inMemoryTrades[tradeIndex];

    if (trade.receiverId !== userId) {
      throw new Error('Только получатель предложения может согласовать трейд');
    }

    if (trade.status !== 'PENDING') {
      throw new Error(`Нельзя согласовать трейд со статусом "${trade.status}"`);
    }

    // Move to AGREED status (conditions fixed, waiting for physical book exchange)
    trade.status = 'AGREED';
    trade.updatedAt = new Date();

    return formatTradeMock(trade, userId);
  }

  // Database mode: move to AGREED
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });

  if (!trade) {
    throw new Error('Трейд не найден');
  }

  if (trade.receiverId !== userId) {
    throw new Error('Только получатель предложения может согласовать трейд');
  }

  if (trade.status !== 'PENDING') {
    throw new Error(`Нельзя согласовать трейд со статусом "${trade.status}"`);
  }

  const updated = await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'AGREED' },
    include: {
      sender: userSelect,
      receiver: userSelect,
      items: {
        include: {
          book: bookInclude,
        },
      },
    },
  });

  return formatTradePrisma(updated, userId);
};

export const completeTrade = async (tradeId: string, userId: string) => {
  if (isMockMode) {
    const tradeIndex = inMemoryTrades.findIndex((t) => t.id === tradeId);
    if (tradeIndex === -1) {
      throw new Error('Трейд не найден');
    }

    const trade = inMemoryTrades[tradeIndex];

    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new Error('У вас нет прав для завершения этого трейда');
    }

    if (trade.status !== 'AGREED' && trade.status !== 'ACCEPTED') {
      throw new Error(`Завершить можно только согласованный трейд (текущий: "${trade.status}")`);
    }

    // Two-phase completion logic:
    // Mark confirming user as completed
    if (trade.senderId === userId) {
      trade.senderCompleted = true;
    }
    if (trade.receiverId === userId) {
      trade.receiverCompleted = true;
    }

    // Trade is only COMPLETED and books transferred when BOTH sides confirm
    if (trade.senderCompleted && trade.receiverCompleted) {
      const offeredIds = trade.items
        .filter((i) => i.side === 'OFFERED')
        .map((i) => i.bookId);

      const requestedIds = trade.items
        .filter((i) => i.side === 'REQUESTED')
        .map((i) => i.bookId);

      const newOwnerReceiver = findUser(trade.receiverId);
      const newOwnerSender = findUser(trade.senderId);

      for (const b of inMemoryBooks) {
        if (offeredIds.includes(b.id)) {
          b.userId = trade.receiverId;
          b.user = newOwnerReceiver;
          b.isForTrade = false; // Freshly received: visible only to owner until owner enables exchange
        } else if (requestedIds.includes(b.id)) {
          b.userId = trade.senderId;
          b.user = newOwnerSender;
          b.isForTrade = false; // Freshly received: visible only to owner until owner enables exchange
        }
      }

      trade.status = 'COMPLETED';
    }

    trade.updatedAt = new Date();
    return formatTradeMock(trade, userId);
  }

  // Database mode: complete trade and transfer books
  return await prisma.$transaction(async (tx) => {
    const trade = await tx.trade.findUnique({
      where: { id: tradeId },
      include: {
        items: true,
      },
    });

    if (!trade) {
      throw new Error('Трейд не найден');
    }

    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new Error('У вас нет прав для завершения этого трейда');
    }

    if (trade.status !== 'AGREED' && trade.status !== 'ACCEPTED') {
      throw new Error(`Завершить можно только согласованный трейд (текущий: "${trade.status}")`);
    }

    const offeredIds = trade.items
      .filter((i) => i.side === 'OFFERED')
      .map((i) => i.bookId);

    const requestedIds = trade.items
      .filter((i) => i.side === 'REQUESTED')
      .map((i) => i.bookId);

    // Swap book ownership and set isForTrade to false:
    if (offeredIds.length > 0) {
      await tx.book.updateMany({
        where: { id: { in: offeredIds } },
        data: { userId: trade.receiverId, isForTrade: false },
      });
    }

    if (requestedIds.length > 0) {
      await tx.book.updateMany({
        where: { id: { in: requestedIds } },
        data: { userId: trade.senderId, isForTrade: false },
      });
    }

    const updated = await tx.trade.update({
      where: { id: tradeId },
      data: { status: 'COMPLETED' },
      include: {
        sender: userSelect,
        receiver: userSelect,
        items: {
          include: {
            book: bookInclude,
          },
        },
      },
    });

    return formatTradePrisma(updated, userId);
  });
};

export const rejectTrade = async (tradeId: string, userId: string) => {
  if (isMockMode) {
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) throw new Error('Трейд не найден');

    if (trade.receiverId !== userId) {
      throw new Error('Только получатель может отклонить трейд');
    }

    if (trade.status !== 'PENDING') {
      throw new Error(`Нельзя отклонить трейд со статусом "${trade.status}"`);
    }

    trade.status = 'REJECTED';
    trade.updatedAt = new Date();
    return formatTradeMock(trade, userId);
  }

  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  if (!trade) throw new Error('Трейд не найден');
  if (trade.receiverId !== userId) throw new Error('Только получатель может отклонить трейд');
  if (trade.status !== 'PENDING') throw new Error(`Нельзя отклонить трейд со статусом "${trade.status}"`);

  const updated = await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'REJECTED' },
    include: {
      sender: userSelect,
      receiver: userSelect,
      items: {
        include: { book: bookInclude },
      },
    },
  });

  return formatTradePrisma(updated, userId);
};

export const cancelTrade = async (tradeId: string, userId: string) => {
  if (isMockMode) {
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) throw new Error('Трейд не найден');

    if (trade.senderId !== userId) {
      throw new Error('Только создатель предложения может отменить трейд');
    }

    if (trade.status !== 'PENDING') {
      throw new Error(`Нельзя отменить трейд со статусом "${trade.status}"`);
    }

    trade.status = 'CANCELLED';
    trade.updatedAt = new Date();
    return formatTradeMock(trade, userId);
  }

  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  if (!trade) throw new Error('Трейд не найден');
  if (trade.senderId !== userId) throw new Error('Только создатель предложения может отменить трейд');
  if (trade.status !== 'PENDING') throw new Error(`Нельзя отменить трейд со статусом "${trade.status}"`);

  const updated = await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'CANCELLED' },
    include: {
      sender: userSelect,
      receiver: userSelect,
      items: {
        include: { book: bookInclude },
      },
    },
  });

  return formatTradePrisma(updated, userId);
};

export const getPartners = async (currentUserId: string) => {
  if (isMockMode) {
    return MOCK_USERS.filter((u) => u.id !== currentUserId).map((u) => {
      const bookCount = inMemoryBooks.filter((b) => b.userId === u.id).length;
      return {
        id: u.id,
        username: u.username,
        photoURL: u.photoURL,
        city: u.city,
        bookCount,
      };
    });
  }

  const users = await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: {
      id: true,
      username: true,
      photoURL: true,
      city: true,
      _count: {
        select: { books: true },
      },
    },
    orderBy: { username: 'asc' },
  });

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    photoURL: u.photoURL,
    city: u.city,
    bookCount: u._count.books,
  }));
};

export const counterTrade = async (
  originalTradeId: string,
  userId: string,
  data: CreateTradeDto
) => {
  if (isMockMode) {
    const oldTrade = inMemoryTrades.find((t) => t.id === originalTradeId);
    if (!oldTrade) {
      throw new Error('Исходный трейд не найден');
    }
    if (oldTrade.receiverId !== userId) {
      throw new Error('Только получатель предложения может создать встречный трейд');
    }
    if (oldTrade.status !== 'PENDING') {
      throw new Error(`Нельзя изменить трейд со статусом "${oldTrade.status}"`);
    }

    oldTrade.status = 'REJECTED';
    oldTrade.updatedAt = new Date();

    return createTrade(userId, {
      receiverId: oldTrade.senderId,
      offerBookIds: data.offerBookIds,
      targetBookIds: data.targetBookIds,
      message: data.message || 'Встречное предложение к обмену',
    });
  }

  return await prisma.$transaction(async (tx) => {
    const oldTrade = await tx.trade.findUnique({
      where: { id: originalTradeId },
    });

    if (!oldTrade) {
      throw new Error('Исходный трейд не найден');
    }
    if (oldTrade.receiverId !== userId) {
      throw new Error('Только получатель предложения может создать встречный трейд');
    }
    if (oldTrade.status !== 'PENDING') {
      throw new Error(`Нельзя изменить трейд со статусом "${oldTrade.status}"`);
    }

    await tx.trade.update({
      where: { id: originalTradeId },
      data: { status: 'REJECTED' },
    });

    const newTrade = await tx.trade.create({
      data: {
        senderId: userId,
        receiverId: oldTrade.senderId,
        status: 'PENDING',
        message: data.message?.trim() || 'Встречное предложение к обмену',
        items: {
          create: [
            ...data.offerBookIds.map((bookId) => ({
              bookId,
              side: 'OFFERED' as const,
            })),
            ...data.targetBookIds.map((bookId) => ({
              bookId,
              side: 'REQUESTED' as const,
            })),
          ],
        },
      },
      include: {
        sender: userSelect,
        receiver: userSelect,
        items: {
          include: {
            book: bookInclude,
          },
        },
      },
    });

    if (data.message?.trim()) {
      await tx.tradeMessage.create({
        data: {
          tradeId: newTrade.id,
          senderId: userId,
          text: data.message.trim(),
        },
      });
    }

    return formatTradePrisma(newTrade, userId);
  });
};

export const getTradeMessages = async (tradeId: string, userId: string) => {
  if (isMockMode) {
    ensureMockTradesForUser(userId);
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) {
      throw new Error('Трейд не найден');
    }
    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new Error('Нет доступа к переписке этого трейда');
    }

    const messages = inMemoryTradeMessages
      .filter((m) => m.tradeId === tradeId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return messages;
  }

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });
  if (!trade) {
    throw new Error('Трейд не найден');
  }
  if (trade.senderId !== userId && trade.receiverId !== userId) {
    throw new Error('Нет доступа к переписке этого трейда');
  }

  const messages = await prisma.tradeMessage.findMany({
    where: { tradeId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: userSelect,
    },
  });

  return messages;
};

export const sendTradeMessage = async (tradeId: string, userId: string, text: string) => {
  const cleanText = text?.trim();
  if (!cleanText) {
    throw new Error('Сообщение не может быть пустым');
  }

  if (isMockMode) {
    ensureMockTradesForUser(userId);
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) {
      throw new Error('Трейд не найден');
    }
    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new Error('Нет доступа к переписке этого трейда');
    }

    const sender = findUser(userId);
    const newMessage: MockTradeMessage = {
      id: randomUUID(),
      tradeId,
      senderId: userId,
      sender,
      text: cleanText,
      createdAt: new Date(),
    };
    inMemoryTradeMessages.push(newMessage);
    return newMessage;
  }

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });
  if (!trade) {
    throw new Error('Трейд не найден');
  }
  if (trade.senderId !== userId && trade.receiverId !== userId) {
    throw new Error('Нет доступа к переписке этого трейда');
  }

  const message = await prisma.tradeMessage.create({
    data: {
      tradeId,
      senderId: userId,
      text: cleanText,
    },
    include: {
      sender: userSelect,
    },
  });

  return message;
};


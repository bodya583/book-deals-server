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
import {
  computeSimpleHash,
  computeBooksHash,
  validateSelfTrade,
  validateTradePayload,
  validateBookOwnership,
} from './trades.validation.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../utils/errors.js';
import {
  formatTradeMock,
  formatTradePrisma,
  findPrismaTradeById,
  findPrismaBooksByIds,
  userSelect,
  bookInclude,
  type PrismaTradeEntity,
  type FormattedTrade,
} from './trades.repository.js';

export { computeSimpleHash, computeBooksHash };

export interface CreateTradeDto {
  receiverId: string;
  offerBookIds: string[];
  targetBookIds: string[];
  message?: string;
}

export interface TradeFilter {
  tab?: 'incoming' | 'outgoing' | 'agreed' | 'completed' | 'requests' | 'all';
}

export const getTrades = async (userId: string, filter?: TradeFilter): Promise<FormattedTrade[]> => {
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
    } else if (tab === 'requests') {
      list = list.filter(
        (t) => (t.receiverId === userId || t.senderId === userId) && t.status === 'PENDING'
      );
    } else if (tab === 'agreed') {
      list = list.filter((t) => ['AGREED', 'ACCEPTED'].includes(t.status));
    } else if (tab === 'completed') {
      list = list.filter((t) => t.status === 'COMPLETED');
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.map((t) => formatTradeMock(t, userId));
  }

  const tab = filter?.tab || 'all';
  type WhereClause = Record<string, unknown>;
  let where: WhereClause = {};

  if (tab === 'incoming') {
    where = { receiverId: userId, status: 'PENDING' };
  } else if (tab === 'outgoing') {
    where = { senderId: userId, status: 'PENDING' };
  } else if (tab === 'requests') {
    where = {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: 'PENDING',
    };
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

  const trades = (await prisma.trade.findMany({
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
  })) as unknown as PrismaTradeEntity[];

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

    return {
      incoming,
      outgoing,
      requests: incoming + outgoing,
      agreed,
      completed,
      total: userTrades.length,
    };
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

  return { incoming, outgoing, requests: incoming + outgoing, agreed, completed, total };
};

export const getTradeById = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  if (isMockMode) {
    ensureMockTradesForUser(userId);
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) {
      throw new NotFoundError('Trade not found');
    }
    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new ForbiddenError('You do not have access to this trade');
    }
    return formatTradeMock(trade, userId);
  }

  const trade = await findPrismaTradeById(tradeId);

  if (!trade) {
    throw new NotFoundError('Trade not found');
  }

  if (trade.senderId !== userId && trade.receiverId !== userId) {
    throw new ForbiddenError('You do not have access to this trade');
  }

  return formatTradePrisma(trade, userId);
};

export const createTrade = async (senderId: string, data: CreateTradeDto): Promise<FormattedTrade> => {
  const { receiverId, offerBookIds = [], targetBookIds = [], message } = data;

  validateSelfTrade(senderId, receiverId);
  validateTradePayload(offerBookIds, targetBookIds);

  if (isMockMode) {
    ensureMockTradesForUser(senderId);

    // Validate book ownership
    validateBookOwnership(senderId, receiverId, offerBookIds, targetBookIds, inMemoryBooks);

    const sender = findUser(senderId, 'Reader');
    const receiver = findUser(receiverId, 'Partner');

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

  // Database mode: validate ownership before writing
  const allBookIds = [...offerBookIds, ...targetBookIds];
  const dbBooks = await findPrismaBooksByIds(allBookIds);
  validateBookOwnership(senderId, receiverId, offerBookIds, targetBookIds, dbBooks);

  return await prisma.$transaction(async (tx) => {
    const newTrade = (await tx.trade.create({
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
    })) as unknown as PrismaTradeEntity;

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

export const acceptTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  if (isMockMode) {
    const tradeIndex = inMemoryTrades.findIndex((t) => t.id === tradeId);
    if (tradeIndex === -1) {
      throw new NotFoundError('Trade not found');
    }

    const trade = inMemoryTrades[tradeIndex];

    if (trade.receiverId !== userId) {
      throw new ForbiddenError('Only the trade recipient can accept this offer');
    }

    if (trade.status !== 'PENDING') {
      throw new ConflictError(`Cannot accept a trade with status "${trade.status}"`);
    }

    trade.status = 'AGREED';
    trade.updatedAt = new Date();

    return formatTradeMock(trade, userId);
  }

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });

  if (!trade) {
    throw new NotFoundError('Trade not found');
  }

  if (trade.receiverId !== userId) {
    throw new ForbiddenError('Only the trade recipient can accept this offer');
  }

  if (trade.status !== 'PENDING') {
    throw new ConflictError(`Cannot accept a trade with status "${trade.status}"`);
  }

  const updated = (await prisma.trade.update({
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
  })) as unknown as PrismaTradeEntity;

  return formatTradePrisma(updated, userId);
};

export const completeTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  if (isMockMode) {
    const tradeIndex = inMemoryTrades.findIndex((t) => t.id === tradeId);
    if (tradeIndex === -1) {
      throw new NotFoundError('Trade not found');
    }

    const trade = inMemoryTrades[tradeIndex];

    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new ForbiddenError('You do not have permission to complete this trade');
    }

    if (trade.status !== 'AGREED' && trade.status !== 'ACCEPTED') {
      throw new ConflictError(`Only an agreed trade can be completed (current: "${trade.status}")`);
    }

    if (trade.senderId === userId) {
      trade.senderCompleted = true;
    }
    if (trade.receiverId === userId) {
      trade.receiverCompleted = true;
    }

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
          b.isForTrade = false;
        } else if (requestedIds.includes(b.id)) {
          b.userId = trade.senderId;
          b.user = newOwnerSender;
          b.isForTrade = false;
        }
      }

      trade.status = 'COMPLETED';
    }

    trade.updatedAt = new Date();
    return formatTradeMock(trade, userId);
  }

  return await prisma.$transaction(async (tx) => {
    const trade = await tx.trade.findUnique({
      where: { id: tradeId },
      include: { items: true },
    });

    if (!trade) {
      throw new NotFoundError('Trade not found');
    }

    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new ForbiddenError('You do not have permission to complete this trade');
    }

    if (trade.status !== 'AGREED' && trade.status !== 'ACCEPTED') {
      throw new ConflictError(`Only an agreed trade can be completed (current: "${trade.status}")`);
    }

    const offeredIds = trade.items
      .filter((i) => i.side === 'OFFERED')
      .map((i) => i.bookId);

    const requestedIds = trade.items
      .filter((i) => i.side === 'REQUESTED')
      .map((i) => i.bookId);

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

    const updated = (await tx.trade.update({
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
    })) as unknown as PrismaTradeEntity;

    return formatTradePrisma(updated, userId);
  });
};

export const rejectTrade = async (tradeId: string, userId: string, reason?: string): Promise<FormattedTrade> => {
  if (isMockMode) {
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) throw new NotFoundError('Trade not found');

    if (trade.receiverId !== userId) {
      throw new ForbiddenError('Only the recipient can reject a trade');
    }

    if (trade.status !== 'PENDING') {
      throw new ConflictError(`Cannot reject a trade with status "${trade.status}"`);
    }

    trade.status = 'REJECTED';
    trade.updatedAt = new Date();

    if (reason && reason.trim()) {
      const user = findUser(userId);
      inMemoryTradeMessages.push({
        id: randomUUID(),
        tradeId,
        senderId: userId,
        sender: user,
        text: `🚫 Trade offer declined. Reason: ${reason.trim()}`,
        createdAt: new Date(),
      });
    }

    return formatTradeMock(trade, userId);
  }

  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  if (!trade) throw new NotFoundError('Trade not found');
  if (trade.receiverId !== userId) throw new ForbiddenError('Only the recipient can reject a trade');
  if (trade.status !== 'PENDING') throw new ConflictError(`Cannot reject a trade with status "${trade.status}"`);

  const updated = (await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'REJECTED' },
    include: {
      sender: userSelect,
      receiver: userSelect,
      items: {
        include: { book: bookInclude },
      },
    },
  })) as unknown as PrismaTradeEntity;

  if (reason && reason.trim()) {
    await prisma.tradeMessage.create({
      data: {
        tradeId,
        senderId: userId,
        text: `🚫 Trade offer declined. Reason: ${reason.trim()}`,
      },
    });
  }

  return formatTradePrisma(updated, userId);
};

export const cancelTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  if (isMockMode) {
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) throw new NotFoundError('Trade not found');

    if (trade.senderId !== userId) {
      throw new ForbiddenError('Only the offer creator can cancel this trade');
    }

    if (trade.status !== 'PENDING') {
      throw new ConflictError(`Cannot cancel a trade with status "${trade.status}"`);
    }

    trade.status = 'CANCELLED';
    trade.updatedAt = new Date();
    return formatTradeMock(trade, userId);
  }

  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  if (!trade) throw new NotFoundError('Trade not found');
  if (trade.senderId !== userId) throw new ForbiddenError('Only the offer creator can cancel this trade');
  if (trade.status !== 'PENDING') throw new ConflictError(`Cannot cancel a trade with status "${trade.status}"`);

  const updated = (await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'CANCELLED' },
    include: {
      sender: userSelect,
      receiver: userSelect,
      items: {
        include: { book: bookInclude },
      },
    },
  })) as unknown as PrismaTradeEntity;

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
): Promise<FormattedTrade> => {
  if (isMockMode) {
    const oldTrade = inMemoryTrades.find((t) => t.id === originalTradeId);
    if (!oldTrade) {
      throw new NotFoundError('Original trade not found');
    }
    if (oldTrade.senderId !== userId && oldTrade.receiverId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this trade');
    }
    if (oldTrade.status !== 'PENDING') {
      throw new ConflictError(`Cannot modify a trade with status "${oldTrade.status}"`);
    }

    const targetPartnerId = oldTrade.senderId === userId ? oldTrade.receiverId : oldTrade.senderId;
    validateSelfTrade(userId, targetPartnerId);

    // Verify books were changed by comparing pre-sorted books hash
    const oldOffered = oldTrade.items
      .filter((i) => (oldTrade.senderId === userId ? i.side === 'OFFERED' : i.side === 'REQUESTED'))
      .map((i) => i.bookId);
    const oldTarget = oldTrade.items
      .filter((i) => (oldTrade.senderId === userId ? i.side === 'REQUESTED' : i.side === 'OFFERED'))
      .map((i) => i.bookId);

    const oldBooksHash = computeBooksHash(oldOffered, oldTarget);
    const newBooksHash = computeBooksHash(data.offerBookIds, data.targetBookIds);

    if (oldBooksHash === newBooksHash) {
      throw new BadRequestError('Book selection is unchanged. Modify the books to send a counter offer');
    }

    oldTrade.status = oldTrade.senderId === userId ? 'CANCELLED' : 'REJECTED';
    oldTrade.updatedAt = new Date();

    const prevMessages = inMemoryTradeMessages.filter((m) => m.tradeId === originalTradeId);

    const newTrade = await createTrade(userId, {
      receiverId: targetPartnerId,
      offerBookIds: data.offerBookIds,
      targetBookIds: data.targetBookIds,
      message: data.message || 'Counter-offer proposal',
    });

    const currentUser = findUser(userId);
    const copiedMessages: MockTradeMessage[] = prevMessages.map((m) => ({
      id: randomUUID(),
      tradeId: newTrade.id,
      senderId: m.senderId,
      sender: m.sender,
      text: m.text,
      createdAt: m.createdAt,
    }));

    const systemMarker: MockTradeMessage = {
      id: randomUUID(),
      tradeId: newTrade.id,
      senderId: userId,
      sender: currentUser,
      text: '🔄 Counter-offer proposed: book selection updated',
      createdAt: new Date(),
    };

    const currentTradeMessages = inMemoryTradeMessages.filter((m) => m.tradeId === newTrade.id);
    for (let i = inMemoryTradeMessages.length - 1; i >= 0; i--) {
      if (inMemoryTradeMessages[i].tradeId === newTrade.id) {
        inMemoryTradeMessages.splice(i, 1);
      }
    }

    inMemoryTradeMessages.push(...copiedMessages);
    inMemoryTradeMessages.push(systemMarker);
    inMemoryTradeMessages.push(...currentTradeMessages);

    return newTrade;
  }

  return await prisma.$transaction(async (tx) => {
    const oldTrade = await tx.trade.findUnique({
      where: { id: originalTradeId },
      include: { items: true },
    });

    if (!oldTrade) {
      throw new NotFoundError('Original trade not found');
    }
    if (oldTrade.senderId !== userId && oldTrade.receiverId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this trade');
    }
    if (oldTrade.status !== 'PENDING') {
      throw new ConflictError(`Cannot modify a trade with status "${oldTrade.status}"`);
    }

    const targetPartnerId = oldTrade.senderId === userId ? oldTrade.receiverId : oldTrade.senderId;
    validateSelfTrade(userId, targetPartnerId);

    const oldOffered = (oldTrade.items || [])
      .filter((i) => (oldTrade.senderId === userId ? i.side === 'OFFERED' : i.side === 'REQUESTED'))
      .map((i) => i.bookId);
    const oldTarget = (oldTrade.items || [])
      .filter((i) => (oldTrade.senderId === userId ? i.side === 'REQUESTED' : i.side === 'OFFERED'))
      .map((i) => i.bookId);

    const oldBooksHash = computeBooksHash(oldOffered, oldTarget);
    const newBooksHash = computeBooksHash(data.offerBookIds, data.targetBookIds);

    if (oldBooksHash === newBooksHash) {
      throw new BadRequestError('Book selection is unchanged. Modify the books to send a counter offer');
    }

    await tx.trade.update({
      where: { id: originalTradeId },
      data: { status: oldTrade.senderId === userId ? 'CANCELLED' : 'REJECTED' },
    });

    const newTrade = (await tx.trade.create({
      data: {
        senderId: userId,
        receiverId: targetPartnerId,
        status: 'PENDING',
        message: data.message?.trim() || 'Counter-offer proposal',
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
    })) as unknown as PrismaTradeEntity;

    const prevMessages = await tx.tradeMessage.findMany({
      where: { tradeId: originalTradeId },
      orderBy: { createdAt: 'asc' },
    });

    for (const msg of prevMessages) {
      await tx.tradeMessage.create({
        data: {
          tradeId: newTrade.id,
          senderId: msg.senderId,
          text: msg.text,
          createdAt: msg.createdAt,
        },
      });
    }

    await tx.tradeMessage.create({
      data: {
        tradeId: newTrade.id,
        senderId: userId,
        text: '🔄 Counter-offer proposed: book selection updated',
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
      throw new NotFoundError('Trade not found');
    }
    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new ForbiddenError('You do not have access to this trade chat');
    }

    return inMemoryTradeMessages
      .filter((m) => m.tradeId === tradeId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });
  if (!trade) {
    throw new NotFoundError('Trade not found');
  }
  if (trade.senderId !== userId && trade.receiverId !== userId) {
    throw new ForbiddenError('You do not have access to this trade chat');
  }

  return await prisma.tradeMessage.findMany({
    where: { tradeId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: userSelect,
    },
  });
};

export const sendTradeMessage = async (tradeId: string, userId: string, text: string) => {
  const cleanText = text?.trim();
  if (!cleanText) {
    throw new BadRequestError('Message cannot be empty');
  }

  if (isMockMode) {
    ensureMockTradesForUser(userId);
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    if (!trade) {
      throw new NotFoundError('Trade not found');
    }
    if (trade.senderId !== userId && trade.receiverId !== userId) {
      throw new ForbiddenError('You do not have access to this trade chat');
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

    const locAgreeMatch = cleanText.match(/Meeting location agreed:\s*(.*)/i);
    if (locAgreeMatch) {
      trade.agreedLocationHash = computeSimpleHash(locAgreeMatch[1].trim());
    }
    const timeAgreeMatch = cleanText.match(/Meeting time agreed:\s*(.*)/i);
    if (timeAgreeMatch) {
      trade.agreedTimeHash = computeSimpleHash(timeAgreeMatch[1].trim());
    }

    trade.updatedAt = new Date();
    inMemoryTradeMessages.push(newMessage);
    return newMessage;
  }

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });
  if (!trade) {
    throw new NotFoundError('Trade not found');
  }
  if (trade.senderId !== userId && trade.receiverId !== userId) {
    throw new ForbiddenError('You do not have access to this trade chat');
  }

  const [message] = await Promise.all([
    prisma.tradeMessage.create({
      data: {
        tradeId,
        senderId: userId,
        text: cleanText,
      },
      include: {
        sender: userSelect,
      },
    }),
    prisma.trade.update({
      where: { id: tradeId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
};

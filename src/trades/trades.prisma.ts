import { prisma } from '../index.js';
import {
  formatTradePrisma,
  findPrismaTradeById,
  findPrismaBooksByIds,
  tradeRelationsInclude,
  type PrismaTradeEntity,
  type FormattedTrade,
} from './trades.repository.js';
import {
  assertCompletableTrade,
  assertPendingRecipientAction,
  assertPendingSenderCancel,
  assertTradeExists,
  assertTradeParticipant,
  validateBookOwnership,
  validateCounterOffer,
  validateSelfTrade,
  validateTradePayload,
} from './trades.validation.js';
import { COUNTER_OFFER_SYSTEM_TEXT, formatRejectionNotice } from './trades.messages.service.js';
import type { CreateTradeDto, TradeFilter, TradeTab } from './trades.types.js';

const buildTabWhereClause = (userId: string, tab: TradeTab): Record<string, unknown> => {
  switch (tab) {
    case 'incoming':
      return { receiverId: userId, status: 'PENDING' };
    case 'outgoing':
      return { senderId: userId, status: 'PENDING' };
    case 'requests':
      return { OR: [{ senderId: userId }, { receiverId: userId }], status: 'PENDING' };
    case 'agreed':
      return { OR: [{ senderId: userId }, { receiverId: userId }], status: { in: ['AGREED', 'ACCEPTED'] } };
    case 'completed':
      return { OR: [{ senderId: userId }, { receiverId: userId }], status: 'COMPLETED' };
    default:
      return { OR: [{ senderId: userId }, { receiverId: userId }] };
  }
};

export const getPrismaTrades = async (
  userId: string,
  filter?: TradeFilter
): Promise<FormattedTrade[]> => {
  const trades = (await prisma.trade.findMany({
    where: buildTabWhereClause(userId, filter?.tab || 'all'),
    include: tradeRelationsInclude,
    orderBy: { createdAt: 'desc' },
  })) as unknown as PrismaTradeEntity[];

  return trades.map((t) => formatTradePrisma(t, userId));
};

export const getPrismaTradeCounts = async (userId: string) => {
  const rows = await prisma.trade.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    select: { senderId: true, receiverId: true, status: true },
  });

  let incoming = 0;
  let outgoing = 0;
  let agreed = 0;
  let completed = 0;

  for (const row of rows) {
    if (row.status === 'PENDING') {
      if (row.receiverId === userId) incoming += 1;
      else if (row.senderId === userId) outgoing += 1;
    } else if (row.status === 'AGREED' || row.status === 'ACCEPTED') {
      agreed += 1;
    } else if (row.status === 'COMPLETED') {
      completed += 1;
    }
  }

  return { incoming, outgoing, requests: incoming + outgoing, agreed, completed, total: rows.length };
};

export const getPrismaTradeById = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  const trade = await findPrismaTradeById(tradeId);
  assertTradeExists(trade);
  assertTradeParticipant(trade, userId);
  return formatTradePrisma(trade, userId);
};

export const createPrismaTrade = async (
  senderId: string,
  data: CreateTradeDto
): Promise<FormattedTrade> => {
  const { receiverId, offerBookIds = [], targetBookIds = [], message } = data;
  validateSelfTrade(senderId, receiverId);
  validateTradePayload(offerBookIds, targetBookIds);

  const dbBooks = await findPrismaBooksByIds([...offerBookIds, ...targetBookIds]);
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
            ...offerBookIds.map((bookId) => ({ bookId, side: 'OFFERED' as const })),
            ...targetBookIds.map((bookId) => ({ bookId, side: 'REQUESTED' as const })),
          ],
        },
      },
      include: tradeRelationsInclude,
    })) as unknown as PrismaTradeEntity;

    if (message?.trim()) {
      await tx.tradeMessage.create({
        data: { tradeId: newTrade.id, senderId, text: message.trim() },
      });
    }

    return formatTradePrisma(newTrade, senderId);
  });
};

export const acceptPrismaTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  assertTradeExists(trade);
  assertPendingRecipientAction(trade, userId, 'accept');

  const updated = (await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'AGREED' },
    include: tradeRelationsInclude,
  })) as unknown as PrismaTradeEntity;

  return formatTradePrisma(updated, userId);
};

export const completePrismaTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  return await prisma.$transaction(async (tx) => {
    const trade = await tx.trade.findUnique({
      where: { id: tradeId },
      include: { items: true },
    });
    assertTradeExists(trade);
    assertCompletableTrade(trade, userId);

    const isSender = trade.senderId === userId;
    const isReceiver = trade.receiverId === userId;

    const newSenderCompleted = isSender ? true : Boolean(trade.senderCompleted);
    const newReceiverCompleted = isReceiver ? true : Boolean(trade.receiverCompleted);
    const bothCompleted = newSenderCompleted && newReceiverCompleted;

    if (bothCompleted) {
      const offeredIds = trade.items.filter((i) => i.side === 'OFFERED').map((i) => i.bookId);
      const requestedIds = trade.items.filter((i) => i.side === 'REQUESTED').map((i) => i.bookId);

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
        data: {
          status: 'COMPLETED',
          senderCompleted: true,
          receiverCompleted: true,
        },
        include: tradeRelationsInclude,
      })) as unknown as PrismaTradeEntity;

      return formatTradePrisma(updated, userId);
    } else {
      const updated = (await tx.trade.update({
        where: { id: tradeId },
        data: {
          senderCompleted: newSenderCompleted,
          receiverCompleted: newReceiverCompleted,
        },
        include: tradeRelationsInclude,
      })) as unknown as PrismaTradeEntity;

      return formatTradePrisma(updated, userId);
    }
  });
};

export const rejectPrismaTrade = async (
  tradeId: string,
  userId: string,
  reason?: string
): Promise<FormattedTrade> => {
  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  assertTradeExists(trade);
  assertPendingRecipientAction(trade, userId, 'reject');

  const updated = (await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'REJECTED' },
    include: tradeRelationsInclude,
  })) as unknown as PrismaTradeEntity;

  if (reason && reason.trim()) {
    await prisma.tradeMessage.create({
      data: { tradeId, senderId: userId, text: formatRejectionNotice(reason) },
    });
  }

  return formatTradePrisma(updated, userId);
};

export const cancelPrismaTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  assertTradeExists(trade);
  assertPendingSenderCancel(trade, userId);

  const updated = (await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'CANCELLED' },
    include: tradeRelationsInclude,
  })) as unknown as PrismaTradeEntity;

  return formatTradePrisma(updated, userId);
};

export const getPrismaPartners = async (currentUserId: string) => {
  const users = await prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: {
      id: true,
      username: true,
      photoURL: true,
      city: true,
      _count: { select: { books: true } },
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

export const counterPrismaTrade = async (
  originalTradeId: string,
  userId: string,
  data: CreateTradeDto
): Promise<FormattedTrade> => {
  return await prisma.$transaction(async (tx) => {
    const oldTrade = await tx.trade.findUnique({
      where: { id: originalTradeId },
      include: { items: true },
    });
    assertTradeExists(oldTrade, 'Original trade not found');
    const targetPartnerId = validateCounterOffer(
      oldTrade,
      userId,
      data.offerBookIds,
      data.targetBookIds
    );

    await tx.trade.update({
      where: { id: originalTradeId },
      data: { status: 'REJECTED' },
    });

    const newTrade = (await tx.trade.create({
      data: {
        senderId: userId,
        receiverId: targetPartnerId,
        status: 'PENDING',
        message: data.message?.trim() || 'Counter-offer proposal',
        items: {
          create: [
            ...data.offerBookIds.map((bookId) => ({ bookId, side: 'OFFERED' as const })),
            ...data.targetBookIds.map((bookId) => ({ bookId, side: 'REQUESTED' as const })),
          ],
        },
      },
      include: tradeRelationsInclude,
    })) as unknown as PrismaTradeEntity;

    const prevMessages = await tx.tradeMessage.findMany({
      where: { tradeId: originalTradeId },
      orderBy: { createdAt: 'asc' },
    });

    for (const msg of prevMessages) {
      await tx.tradeMessage.create({
        data: { tradeId: newTrade.id, senderId: msg.senderId, text: msg.text, createdAt: msg.createdAt },
      });
    }

    await tx.tradeMessage.create({
      data: { tradeId: newTrade.id, senderId: userId, text: COUNTER_OFFER_SYSTEM_TEXT },
    });

    if (data.message?.trim()) {
      await tx.tradeMessage.create({
        data: { tradeId: newTrade.id, senderId: userId, text: data.message.trim() },
      });
    }

    return formatTradePrisma(newTrade, userId);
  });
};

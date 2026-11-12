import { randomUUID } from 'crypto';
import { inMemoryBooks, MOCK_USERS } from '../mocks/mockBooks.js';
import {
  inMemoryTrades,
  ensureMockTradesForUser,
  findUser,
  MockTrade,
  inMemoryTradeMessages,
  MockTradeMessage,
} from '../mocks/mockTrades.js';
import { formatTradeMock, type FormattedTrade } from './trades.repository.js';
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
import type { CreateTradeDto, TradeFilter } from './trades.types.js';

export const getMockTrades = async (
  userId: string,
  filter?: TradeFilter
): Promise<FormattedTrade[]> => {
  ensureMockTradesForUser(userId);
  let list = inMemoryTrades.filter((t) => t.senderId === userId || t.receiverId === userId);
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
};

export const getMockTradeCounts = async (userId: string) => {
  ensureMockTradesForUser(userId);
  const userTrades = inMemoryTrades.filter((t) => t.senderId === userId || t.receiverId === userId);
  const incoming = userTrades.filter((t) => t.receiverId === userId && t.status === 'PENDING').length;
  const outgoing = userTrades.filter((t) => t.senderId === userId && t.status === 'PENDING').length;
  const agreed = userTrades.filter((t) => ['AGREED', 'ACCEPTED'].includes(t.status)).length;
  const completed = userTrades.filter((t) => t.status === 'COMPLETED').length;

  return {
    incoming,
    outgoing,
    requests: incoming + outgoing,
    agreed,
    completed,
    total: userTrades.length,
  };
};

export const getMockTradeById = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  ensureMockTradesForUser(userId);
  const trade = inMemoryTrades.find((t) => t.id === tradeId);
  assertTradeExists(trade);
  assertTradeParticipant(trade, userId);
  return formatTradeMock(trade, userId);
};

export const createMockTrade = async (
  senderId: string,
  data: CreateTradeDto
): Promise<FormattedTrade> => {
  const { receiverId, offerBookIds = [], targetBookIds = [], message } = data;
  validateSelfTrade(senderId, receiverId);
  validateTradePayload(offerBookIds, targetBookIds);
  ensureMockTradesForUser(senderId);
  validateBookOwnership(senderId, receiverId, offerBookIds, targetBookIds, inMemoryBooks);

  const sender = findUser(senderId, 'Reader');
  const receiver = findUser(receiverId, 'Partner');
  const offeredBooks = inMemoryBooks.filter((b) => offerBookIds.includes(b.id));
  const targetBooks = inMemoryBooks.filter((b) => targetBookIds.includes(b.id));

  const items = [
    ...offeredBooks.map((b) => ({ id: randomUUID(), bookId: b.id, side: 'OFFERED' as const, book: b })),
    ...targetBooks.map((b) => ({ id: randomUUID(), bookId: b.id, side: 'REQUESTED' as const, book: b })),
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
};

export const acceptMockTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  const trade = inMemoryTrades.find((t) => t.id === tradeId);
  assertTradeExists(trade);
  assertPendingRecipientAction(trade, userId, 'accept');
  trade.status = 'AGREED';
  trade.updatedAt = new Date();
  return formatTradeMock(trade, userId);
};

export const completeMockTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  const trade = inMemoryTrades.find((t) => t.id === tradeId);
  assertTradeExists(trade);
  assertCompletableTrade(trade, userId);

  if (trade.senderId === userId) trade.senderCompleted = true;
  if (trade.receiverId === userId) trade.receiverCompleted = true;

  if (trade.senderCompleted && trade.receiverCompleted) {
    const offeredIds = trade.items.filter((i) => i.side === 'OFFERED').map((i) => i.bookId);
    const requestedIds = trade.items.filter((i) => i.side === 'REQUESTED').map((i) => i.bookId);
    const receiverOwner = findUser(trade.receiverId);
    const senderOwner = findUser(trade.senderId);

    for (const book of inMemoryBooks) {
      if (offeredIds.includes(book.id)) {
        book.userId = trade.receiverId;
        book.user = receiverOwner;
        book.isForTrade = false;
      } else if (requestedIds.includes(book.id)) {
        book.userId = trade.senderId;
        book.user = senderOwner;
        book.isForTrade = false;
      }
    }
    trade.status = 'COMPLETED';
  }

  trade.updatedAt = new Date();
  return formatTradeMock(trade, userId);
};

export const rejectMockTrade = async (
  tradeId: string,
  userId: string,
  reason?: string
): Promise<FormattedTrade> => {
  const trade = inMemoryTrades.find((t) => t.id === tradeId);
  assertTradeExists(trade);
  assertPendingRecipientAction(trade, userId, 'reject');

  trade.status = 'REJECTED';
  trade.updatedAt = new Date();

  if (reason && reason.trim()) {
    inMemoryTradeMessages.push({
      id: randomUUID(),
      tradeId,
      senderId: userId,
      sender: findUser(userId),
      text: formatRejectionNotice(reason),
      createdAt: new Date(),
    });
  }

  return formatTradeMock(trade, userId);
};

export const cancelMockTrade = async (tradeId: string, userId: string): Promise<FormattedTrade> => {
  const trade = inMemoryTrades.find((t) => t.id === tradeId);
  assertTradeExists(trade);
  assertPendingSenderCancel(trade, userId);
  trade.status = 'CANCELLED';
  trade.updatedAt = new Date();
  return formatTradeMock(trade, userId);
};

export const getMockPartners = async (currentUserId: string) => {
  return MOCK_USERS.filter((u) => u.id !== currentUserId).map((u) => ({
    id: u.id,
    username: u.username,
    photoURL: u.photoURL,
    city: u.city,
    bookCount: inMemoryBooks.filter((b) => b.userId === u.id).length,
  }));
};

export const counterMockTrade = async (
  originalTradeId: string,
  userId: string,
  data: CreateTradeDto
): Promise<FormattedTrade> => {
  const oldTrade = inMemoryTrades.find((t) => t.id === originalTradeId);
  assertTradeExists(oldTrade, 'Original trade not found');
  const targetPartnerId = validateCounterOffer(
    oldTrade,
    userId,
    data.offerBookIds,
    data.targetBookIds
  );

  oldTrade.status = oldTrade.senderId === userId ? 'CANCELLED' : 'REJECTED';
  oldTrade.updatedAt = new Date();

  const prevMessages = inMemoryTradeMessages.filter((m) => m.tradeId === originalTradeId);
  const newTrade = await createMockTrade(userId, {
    receiverId: targetPartnerId,
    offerBookIds: data.offerBookIds,
    targetBookIds: data.targetBookIds,
    message: data.message || 'Counter-offer proposal',
  });

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
    sender: findUser(userId),
    text: COUNTER_OFFER_SYSTEM_TEXT,
    createdAt: new Date(),
  };

  const currentTradeMessages = inMemoryTradeMessages.filter((m) => m.tradeId === newTrade.id);
  for (let i = inMemoryTradeMessages.length - 1; i >= 0; i--) {
    if (inMemoryTradeMessages[i].tradeId === newTrade.id) {
      inMemoryTradeMessages.splice(i, 1);
    }
  }

  inMemoryTradeMessages.push(...copiedMessages, systemMarker, ...currentTradeMessages);
  return newTrade;
};

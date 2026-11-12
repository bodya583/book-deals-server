import { randomUUID } from 'crypto';
import { prisma } from '../index.js';
import { isMockMode } from '../config/env.js';
import {
  inMemoryTrades,
  ensureMockTradesForUser,
  findUser,
  inMemoryTradeMessages,
  MockTradeMessage,
} from '../mocks/mockTrades.js';
import { BadRequestError } from '../utils/errors.js';
import { userSelect } from './trades.repository.js';
import {
  computeSimpleHash,
  assertTradeExists,
  assertTradeParticipant,
} from './trades.validation.js';

export const COUNTER_OFFER_SYSTEM_TEXT = '🔄 Counter-offer proposed: book selection updated';

export const formatRejectionNotice = (reason: string): string =>
  `🚫 Trade offer declined. Reason: ${reason.trim()}`;

export const extractHandoverHashes = (
  text: string
): { agreedLocationHash?: string; agreedTimeHash?: string } => {
  const result: { agreedLocationHash?: string; agreedTimeHash?: string } = {};
  const locAgreeMatch = text.match(/Meeting location agreed:\s*(.*)/i);
  if (locAgreeMatch) {
    result.agreedLocationHash = computeSimpleHash(locAgreeMatch[1].trim());
  }
  const timeAgreeMatch = text.match(/Meeting time agreed:\s*(.*)/i);
  if (timeAgreeMatch) {
    result.agreedTimeHash = computeSimpleHash(timeAgreeMatch[1].trim());
  }
  return result;
};

export const getTradeMessages = async (tradeId: string, userId: string) => {
  if (isMockMode) {
    ensureMockTradesForUser(userId);
    const trade = inMemoryTrades.find((t) => t.id === tradeId);
    assertTradeExists(trade);
    assertTradeParticipant(trade, userId, 'You do not have access to this trade chat');

    return inMemoryTradeMessages
      .filter((m) => m.tradeId === tradeId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  assertTradeExists(trade);
  assertTradeParticipant(trade, userId, 'You do not have access to this trade chat');

  return await prisma.tradeMessage.findMany({
    where: { tradeId },
    orderBy: { createdAt: 'asc' },
    include: { sender: userSelect },
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
    assertTradeExists(trade);
    assertTradeParticipant(trade, userId, 'You do not have access to this trade chat');

    const newMessage: MockTradeMessage = {
      id: randomUUID(),
      tradeId,
      senderId: userId,
      sender: findUser(userId),
      text: cleanText,
      createdAt: new Date(),
    };

    const hashes = extractHandoverHashes(cleanText);
    if (hashes.agreedLocationHash) trade.agreedLocationHash = hashes.agreedLocationHash;
    if (hashes.agreedTimeHash) trade.agreedTimeHash = hashes.agreedTimeHash;

    trade.updatedAt = new Date();
    inMemoryTradeMessages.push(newMessage);
    return newMessage;
  }

  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  assertTradeExists(trade);
  assertTradeParticipant(trade, userId, 'You do not have access to this trade chat');

  const [message] = await Promise.all([
    prisma.tradeMessage.create({
      data: { tradeId, senderId: userId, text: cleanText },
      include: { sender: userSelect },
    }),
    prisma.trade.update({
      where: { id: tradeId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
};

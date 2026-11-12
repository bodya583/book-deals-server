import { isMockMode } from '../config/env.js';
import type { FormattedTrade } from './trades.repository.js';
import { computeSimpleHash, computeBooksHash } from './trades.validation.js';
import { getTradeMessages, sendTradeMessage } from './trades.messages.service.js';
import type { CreateTradeDto, TradeFilter } from './trades.types.js';
import {
  acceptMockTrade,
  cancelMockTrade,
  completeMockTrade,
  counterMockTrade,
  createMockTrade,
  getMockPartners,
  getMockTradeById,
  getMockTradeCounts,
  getMockTrades,
  rejectMockTrade,
} from './trades.mock.js';
import {
  acceptPrismaTrade,
  cancelPrismaTrade,
  completePrismaTrade,
  counterPrismaTrade,
  createPrismaTrade,
  getPrismaPartners,
  getPrismaTradeById,
  getPrismaTradeCounts,
  getPrismaTrades,
  rejectPrismaTrade,
} from './trades.prisma.js';

export { computeSimpleHash, computeBooksHash };
export { getTradeMessages, sendTradeMessage };
export type { CreateTradeDto, TradeFilter };

export const getTrades = (userId: string, filter?: TradeFilter): Promise<FormattedTrade[]> =>
  isMockMode ? getMockTrades(userId, filter) : getPrismaTrades(userId, filter);

export const getTradeCounts = (userId: string) =>
  isMockMode ? getMockTradeCounts(userId) : getPrismaTradeCounts(userId);

export const getTradeById = (tradeId: string, userId: string): Promise<FormattedTrade> =>
  isMockMode ? getMockTradeById(tradeId, userId) : getPrismaTradeById(tradeId, userId);

export const createTrade = (senderId: string, data: CreateTradeDto): Promise<FormattedTrade> =>
  isMockMode ? createMockTrade(senderId, data) : createPrismaTrade(senderId, data);

export const acceptTrade = (tradeId: string, userId: string): Promise<FormattedTrade> =>
  isMockMode ? acceptMockTrade(tradeId, userId) : acceptPrismaTrade(tradeId, userId);

export const completeTrade = (tradeId: string, userId: string): Promise<FormattedTrade> =>
  isMockMode ? completeMockTrade(tradeId, userId) : completePrismaTrade(tradeId, userId);

export const rejectTrade = (
  tradeId: string,
  userId: string,
  reason?: string
): Promise<FormattedTrade> =>
  isMockMode ? rejectMockTrade(tradeId, userId, reason) : rejectPrismaTrade(tradeId, userId, reason);

export const cancelTrade = (tradeId: string, userId: string): Promise<FormattedTrade> =>
  isMockMode ? cancelMockTrade(tradeId, userId) : cancelPrismaTrade(tradeId, userId);

export const getPartners = (currentUserId: string) =>
  isMockMode ? getMockPartners(currentUserId) : getPrismaPartners(currentUserId);

export const counterTrade = (
  originalTradeId: string,
  userId: string,
  data: CreateTradeDto
): Promise<FormattedTrade> =>
  isMockMode
    ? counterMockTrade(originalTradeId, userId, data)
    : counterPrismaTrade(originalTradeId, userId, data);

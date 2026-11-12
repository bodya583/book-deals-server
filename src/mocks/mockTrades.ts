import { inMemoryBooks, MOCK_USERS, MockUser } from './mockBooks.js';
import type { MockTrade, MockTradeItem, MockTradeMessage } from './mockTrades.types.js';
import { createInitialSeedTrades } from './mockTrades.seed.js';

export type { MockTrade, MockTradeItem, MockTradeMessage };

export let inMemoryTrades: MockTrade[] = [];
export let inMemoryTradeMessages: MockTradeMessage[] = [];

export const findUser = (id: string, fallbackUsername = 'Reader'): MockUser => {
  const u = MOCK_USERS.find((user) => user.id === id);
  if (u) return { ...u };
  return {
    id,
    username: fallbackUsername === 'You' ? 'Reader' : fallbackUsername,
    photoURL: null,
    city: 'Kyiv',
  };
};

export const ensureMockTradesForUser = (userId: string) => {
  if (userId !== 'u-1') return;

  const hasUserTrades = inMemoryTrades.some(
    (t) => t.senderId === userId || t.receiverId === userId
  );
  if (hasUserTrades || inMemoryBooks.length < 4) return;

  const currentUser = MOCK_USERS.find((u) => u.id === 'u-1');
  if (!currentUser) return;

  const otherUsers = MOCK_USERS.filter((u) => u.id !== 'u-1');
  const partners: MockUser[] = [
    otherUsers[0] || { id: 'u-2', username: 'olga_books', city: 'Lviv' },
    otherUsers[1] || { id: 'u-3', username: 'serhiy_dev', city: 'Odesa' },
    otherUsers[2] || { id: 'u-4', username: 'maria_reading', city: 'Kharkiv' },
  ];

  const userBooks = inMemoryBooks.filter((b) => b.userId === 'u-1');
  if (userBooks.length === 0) return;

  const seeded = createInitialSeedTrades({
    userId: 'u-1',
    currentUser,
    partners,
    allBooks: inMemoryBooks,
    userBooks,
  });

  inMemoryTrades.push(...seeded.trades);
  inMemoryTradeMessages.push(...seeded.messages);
};

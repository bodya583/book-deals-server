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

export const ensureMockTradesForUser = (userId: string, username?: string) => {
  for (let i = inMemoryTrades.length - 1; i >= 0; i--) {
    const t = inMemoryTrades[i];
    if (t.senderId === t.receiverId || t.sender?.id === t.receiver?.id) {
      inMemoryTrades.splice(i, 1);
    }
  }

  const userFromMock = MOCK_USERS.find((u) => u.id === userId);
  const resolvedUsername =
    userFromMock?.username || (username && username !== 'You' ? username : 'alex_reader');
  const resolvedCity = userFromMock?.city || 'Kyiv';

  for (const t of inMemoryTrades) {
    if (t.sender && (t.sender.username === 'You' || t.sender.id === userId)) {
      t.sender.username = resolvedUsername;
      t.sender.city = resolvedCity;
    }
    if (t.receiver && (t.receiver.username === 'You' || t.receiver.id === userId)) {
      t.receiver.username = resolvedUsername;
      t.receiver.city = resolvedCity;
    }
  }

  const hasUserTrades = inMemoryTrades.some(
    (t) => t.senderId === userId || t.receiverId === userId
  );
  if (hasUserTrades || inMemoryBooks.length < 4) return;

  const otherUsers = MOCK_USERS.filter((u) => u.id !== userId);
  const partners: MockUser[] = [
    otherUsers[0] || { id: 'u-2', username: 'olga_books', city: 'Lviv' },
    otherUsers[1] || { id: 'u-3', username: 'serhiy_dev', city: 'Odesa' },
    otherUsers[2] || { id: 'u-4', username: 'maria_reading', city: 'Kharkiv' },
  ];

  const currentUser: MockUser = {
    id: userId,
    username: resolvedUsername,
    photoURL: userFromMock?.photoURL || null,
    city: resolvedCity,
  };

  let userBooks = inMemoryBooks.filter((b) => b.userId === userId);
  if (userBooks.length === 0) {
    const partnerIds = new Set(partners.map((p) => p.id));
    const candidates = inMemoryBooks.filter((b) => !partnerIds.has(b.userId || '')).slice(0, 4);
    candidates.forEach((b) => {
      b.userId = userId;
      b.user = currentUser;
    });
    userBooks = candidates;
  }

  const seeded = createInitialSeedTrades({
    userId,
    currentUser,
    partners,
    allBooks: inMemoryBooks,
    userBooks,
  });

  inMemoryTrades.push(...seeded.trades);
  inMemoryTradeMessages.push(...seeded.messages);
};

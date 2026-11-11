import { randomUUID } from 'crypto';
import { inMemoryBooks, MOCK_USERS, MockUser } from './mockBooks.js';

export interface MockTradeItem {
  id: string;
  bookId: string;
  side: 'OFFERED' | 'REQUESTED';
  book: any;
}

export interface MockTrade {
  id: string;
  senderId: string;
  sender: MockUser;
  receiverId: string;
  receiver: MockUser;
  status: 'PENDING' | 'AGREED' | 'COMPLETED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: MockTradeItem[];
  senderCompleted?: boolean;
  receiverCompleted?: boolean;
  agreedLocationHash?: string;
  agreedTimeHash?: string;
}

export interface MockTradeMessage {
  id: string;
  tradeId: string;
  senderId: string;
  sender: MockUser;
  text: string;
  createdAt: Date;
}

export let inMemoryTrades: MockTrade[] = [];
export let inMemoryTradeMessages: MockTradeMessage[] = [];

// Helper to find a user or create a fallback
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
  // Clean up any invalid self-trades
  for (let i = inMemoryTrades.length - 1; i >= 0; i--) {
    const t = inMemoryTrades[i];
    if (t.senderId === t.receiverId || t.sender?.id === t.receiver?.id) {
      inMemoryTrades.splice(i, 1);
    }
  }

  const userFromMock = MOCK_USERS.find((u) => u.id === userId);
  const resolvedUsername = userFromMock?.username || (username && username !== 'You' ? username : 'alex_reader');
  const resolvedCity = userFromMock?.city || 'Kyiv';

  // Fix any existing trades in memory with placeholder username
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

  if (!hasUserTrades && inMemoryBooks.length >= 4) {
    const otherUsers = MOCK_USERS.filter((u) => u.id !== userId);
    const partner1 = otherUsers[0] || { id: 'u-2', username: 'olga_books', city: 'Lviv' };
    const partner2 = otherUsers[1] || { id: 'u-3', username: 'serhiy_dev', city: 'Odesa' };
    const partner3 = otherUsers[2] || { id: 'u-4', username: 'maria_reading', city: 'Kharkiv' };

    const currentUser: MockUser = {
      id: userId,
      username: resolvedUsername,
      photoURL: userFromMock?.photoURL || null,
      city: resolvedCity,
    };

    // Ensure current user has their own books in My Library
    let userBooks = inMemoryBooks.filter((b) => b.userId === userId);
    if (userBooks.length === 0) {
      const candidates = inMemoryBooks.filter(
        (b) => b.userId !== partner1.id && b.userId !== partner2.id && b.userId !== partner3.id
      ).slice(0, 4);
      candidates.forEach((b) => {
        b.userId = userId;
        b.user = currentUser;
      });
      userBooks = candidates;
    }

    // Find books owned by partners
    const partner1Books = inMemoryBooks.filter((b) => b.userId === partner1.id);
    const partner2Books = inMemoryBooks.filter((b) => b.userId === partner2.id);
    const partner3Books = inMemoryBooks.filter((b) => b.userId === partner3.id);

    // Pick books for sample trades
    const p1Book = partner1Books[0] || inMemoryBooks[0];
    const p2Book = partner2Books[0] || inMemoryBooks[1];
    const p3Book = partner3Books[0] || inMemoryBooks[2];
    const myBook = userBooks[0] || inMemoryBooks[3];
    const myBook2 = userBooks[1] || inMemoryBooks[4] || inMemoryBooks[0];

    // 1. Incoming Pending trade: partner1 offers p1Book for user's myBook
    const t1Id = randomUUID();
    inMemoryTrades.push({
      id: t1Id,
      senderId: partner1.id,
      sender: partner1,
      receiverId: userId,
      receiver: currentUser,
      status: 'PENDING',
      message: 'Hi! Been looking for this book for a long time. Interested in a swap, mine is in great condition!',
      createdAt: new Date(Date.now() - 3600000 * 4),
      updatedAt: new Date(Date.now() - 3600000 * 4),
      items: [
        {
          id: randomUUID(),
          bookId: p1Book.id,
          side: 'OFFERED',
          book: p1Book,
        },
        {
          id: randomUUID(),
          bookId: myBook.id,
          side: 'REQUESTED',
          book: myBook,
        },
      ],
    });
    inMemoryTradeMessages.push(
      {
        id: randomUUID(),
        tradeId: t1Id,
        senderId: partner1.id,
        sender: partner1,
        text: 'Hi! Been looking for this book for a long time. Interested in a swap, mine is in great condition!',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        id: randomUUID(),
        tradeId: t1Id,
        senderId: partner1.id,
        sender: partner1,
        text: '📍 Meeting location proposal: Shevchenko Park, near the main fountain',
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        id: randomUUID(),
        tradeId: t1Id,
        senderId: partner1.id,
        sender: partner1,
        text: '🕒 Meeting time proposal: Tomorrow at 17:30',
        createdAt: new Date(Date.now() - 3600000 * 2),
      }
    );

    // 2. Outgoing Pending trade: user offers myBook for partner2's p2Book
    const t2Id = randomUUID();
    inMemoryTrades.push({
      id: t2Id,
      senderId: userId,
      sender: currentUser,
      receiverId: partner2.id,
      receiver: partner2,
      status: 'PENDING',
      message: 'Hello! Ready to swap, let me know if this works for you.',
      createdAt: new Date(Date.now() - 3600000 * 24),
      updatedAt: new Date(Date.now() - 3600000 * 24),
      items: [
        {
          id: randomUUID(),
          bookId: myBook.id,
          side: 'OFFERED',
          book: myBook,
        },
        {
          id: randomUUID(),
          bookId: p2Book.id,
          side: 'REQUESTED',
          book: p2Book,
        },
      ],
    });
    inMemoryTradeMessages.push({
      id: randomUUID(),
      tradeId: t2Id,
      senderId: userId,
      sender: currentUser,
      text: 'Hello! Ready to swap, let me know if this works for you.',
      createdAt: new Date(Date.now() - 3600000 * 24),
    });

    // 3. Agreed trade: agreed between user and partner2
    const t3Id = randomUUID();
    inMemoryTrades.push({
      id: t3Id,
      senderId: partner2.id,
      sender: partner2,
      receiverId: userId,
      receiver: currentUser,
      status: 'AGREED',
      message: 'Deal! Exchange terms locked. Let us agree on handover details.',
      senderCompleted: false,
      receiverCompleted: false,
      createdAt: new Date(Date.now() - 3600000 * 12),
      updatedAt: new Date(Date.now() - 3600000 * 6),
      items: [
        {
          id: randomUUID(),
          bookId: p2Book.id,
          side: 'OFFERED',
          book: p2Book,
        },
        {
          id: randomUUID(),
          bookId: myBook2.id,
          side: 'REQUESTED',
          book: myBook2,
        },
      ],
    });
    inMemoryTradeMessages.push(
      {
        id: randomUUID(),
        tradeId: t3Id,
        senderId: partner2.id,
        sender: partner2,
        text: 'Hi! Let us swap books.',
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
      {
        id: randomUUID(),
        tradeId: t3Id,
        senderId: userId,
        sender: currentUser,
        text: 'Sounds great, I agree! Where would you like to meet?',
        createdAt: new Date(Date.now() - 3600000 * 10),
      },
      {
        id: randomUUID(),
        tradeId: t3Id,
        senderId: partner2.id,
        sender: partner2,
        text: 'Deal! Exchange terms are locked.',
        createdAt: new Date(Date.now() - 3600000 * 6),
      },
      {
        id: randomUUID(),
        tradeId: t3Id,
        senderId: partner2.id,
        sender: partner2,
        text: '📍 Meeting location proposal: Lviv, Rynok Square, City Hall entrance',
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        id: randomUUID(),
        tradeId: t3Id,
        senderId: userId,
        sender: currentUser,
        text: '✅ Meeting location agreed: Lviv, Rynok Square, City Hall entrance',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        id: randomUUID(),
        tradeId: t3Id,
        senderId: partner2.id,
        sender: partner2,
        text: '🕒 Meeting time proposal: This Saturday at 14:00',
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        id: randomUUID(),
        tradeId: t3Id,
        senderId: userId,
        sender: currentUser,
        text: '✅ Meeting time agreed: This Saturday at 14:00',
        createdAt: new Date(Date.now() - 3600000 * 2),
      }
    );

    // 4. Completed trade: past completed trade between user and partner3
    const t4Id = randomUUID();
    inMemoryTrades.push({
      id: t4Id,
      senderId: partner3.id,
      sender: partner3,
      receiverId: userId,
      receiver: currentUser,
      status: 'COMPLETED',
      message: 'Thanks for the trade! Books received, swap completed smoothly 👍',
      senderCompleted: true,
      receiverCompleted: true,
      createdAt: new Date(Date.now() - 3600000 * 72),
      updatedAt: new Date(Date.now() - 3600000 * 48),
      items: [
        {
          id: randomUUID(),
          bookId: p3Book.id,
          side: 'OFFERED',
          book: p3Book,
        },
        {
          id: randomUUID(),
          bookId: myBook.id,
          side: 'REQUESTED',
          book: myBook,
        },
      ],
    });
    inMemoryTradeMessages.push(
      {
        id: randomUUID(),
        tradeId: t4Id,
        senderId: partner3.id,
        sender: partner3,
        text: 'Sent the book! Tracking number shared.',
        createdAt: new Date(Date.now() - 3600000 * 60),
      },
      {
        id: randomUUID(),
        tradeId: t4Id,
        senderId: userId,
        sender: currentUser,
        text: 'Received the package, the book is in mint condition!',
        createdAt: new Date(Date.now() - 3600000 * 50),
      },
      {
        id: randomUUID(),
        tradeId: t4Id,
        senderId: partner3.id,
        sender: partner3,
        text: 'Thanks for the trade! Books received, swap completed smoothly 👍',
        createdAt: new Date(Date.now() - 3600000 * 48),
      }
    );
  }
};

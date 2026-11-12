import { randomUUID } from 'crypto';
import type { MockBook, MockUser } from './mockBooks.types.js';
import type { MockTrade, MockTradeMessage } from './mockTrades.types.js';

interface SeedContext {
  userId: string;
  currentUser: MockUser;
  partners: MockUser[];
  allBooks: MockBook[];
  userBooks: MockBook[];
}

export const createInitialSeedTrades = ({
  userId,
  currentUser,
  partners,
  allBooks,
  userBooks,
}: SeedContext): { trades: MockTrade[]; messages: MockTradeMessage[] } => {
  const [partner1, partner2, partner3] = partners;
  const p1Book = allBooks.find((b) => b.userId === partner1.id) || allBooks[0];
  const p2Book = allBooks.find((b) => b.userId === partner2.id) || allBooks[1];
  const p3Book = allBooks.find((b) => b.userId === partner3.id) || allBooks[2];
  const myBook = userBooks[0] || allBooks[3];
  const myBook2 = userBooks[1] || allBooks[4] || allBooks[0];

  const hour = 3_600_000;
  const ago = (h: number) => new Date(Date.now() - hour * h);

  const t1Id = randomUUID();
  const t2Id = randomUUID();
  const t3Id = randomUUID();
  const t4Id = randomUUID();

  const trades: MockTrade[] = [
    {
      id: t1Id,
      senderId: partner1.id,
      sender: partner1,
      receiverId: userId,
      receiver: currentUser,
      status: 'PENDING',
      message: 'Hi! Been looking for this book for a long time. Interested in a swap, mine is in great condition!',
      createdAt: ago(4),
      updatedAt: ago(4),
      items: [
        { id: randomUUID(), bookId: p1Book.id, side: 'OFFERED', book: p1Book },
        { id: randomUUID(), bookId: myBook.id, side: 'REQUESTED', book: myBook },
      ],
    },
    {
      id: t2Id,
      senderId: userId,
      sender: currentUser,
      receiverId: partner2.id,
      receiver: partner2,
      status: 'PENDING',
      message: 'Hello! Ready to swap, let me know if this works for you.',
      createdAt: ago(24),
      updatedAt: ago(24),
      items: [
        { id: randomUUID(), bookId: myBook.id, side: 'OFFERED', book: myBook },
        { id: randomUUID(), bookId: p2Book.id, side: 'REQUESTED', book: p2Book },
      ],
    },
    {
      id: t3Id,
      senderId: partner2.id,
      sender: partner2,
      receiverId: userId,
      receiver: currentUser,
      status: 'AGREED',
      message: 'Deal! Exchange terms locked. Let us agree on handover details.',
      senderCompleted: false,
      receiverCompleted: false,
      createdAt: ago(12),
      updatedAt: ago(6),
      items: [
        { id: randomUUID(), bookId: p2Book.id, side: 'OFFERED', book: p2Book },
        { id: randomUUID(), bookId: myBook2.id, side: 'REQUESTED', book: myBook2 },
      ],
    },
    {
      id: t4Id,
      senderId: partner3.id,
      sender: partner3,
      receiverId: userId,
      receiver: currentUser,
      status: 'COMPLETED',
      message: 'Thanks for the trade! Books received, swap completed smoothly 👍',
      senderCompleted: true,
      receiverCompleted: true,
      createdAt: ago(72),
      updatedAt: ago(48),
      items: [
        { id: randomUUID(), bookId: p3Book.id, side: 'OFFERED', book: p3Book },
        { id: randomUUID(), bookId: myBook.id, side: 'REQUESTED', book: myBook },
      ],
    },
  ];

  const messages: MockTradeMessage[] = [
    {
      id: randomUUID(),
      tradeId: t1Id,
      senderId: partner1.id,
      sender: partner1,
      text: 'Hi! Been looking for this book for a long time. Interested in a swap, mine is in great condition!',
      createdAt: ago(4),
    },
    {
      id: randomUUID(),
      tradeId: t1Id,
      senderId: partner1.id,
      sender: partner1,
      text: '📍 Meeting location proposal: Shevchenko Park, near the main fountain',
      createdAt: ago(3),
    },
    {
      id: randomUUID(),
      tradeId: t1Id,
      senderId: partner1.id,
      sender: partner1,
      text: '🕒 Meeting time proposal: Tomorrow at 17:30',
      createdAt: ago(2),
    },
    {
      id: randomUUID(),
      tradeId: t2Id,
      senderId: userId,
      sender: currentUser,
      text: 'Hello! Ready to swap, let me know if this works for you.',
      createdAt: ago(24),
    },
    {
      id: randomUUID(),
      tradeId: t3Id,
      senderId: partner2.id,
      sender: partner2,
      text: 'Hi! Let us swap books.',
      createdAt: ago(12),
    },
    {
      id: randomUUID(),
      tradeId: t3Id,
      senderId: userId,
      sender: currentUser,
      text: 'Sounds great, I agree! Where would you like to meet?',
      createdAt: ago(10),
    },
    {
      id: randomUUID(),
      tradeId: t3Id,
      senderId: partner2.id,
      sender: partner2,
      text: 'Deal! Exchange terms are locked.',
      createdAt: ago(6),
    },
    {
      id: randomUUID(),
      tradeId: t3Id,
      senderId: partner2.id,
      sender: partner2,
      text: '📍 Meeting location proposal: Lviv, Rynok Square, City Hall entrance',
      createdAt: ago(5),
    },
    {
      id: randomUUID(),
      tradeId: t3Id,
      senderId: userId,
      sender: currentUser,
      text: '✅ Meeting location agreed: Lviv, Rynok Square, City Hall entrance',
      createdAt: ago(4),
    },
    {
      id: randomUUID(),
      tradeId: t3Id,
      senderId: partner2.id,
      sender: partner2,
      text: '🕒 Meeting time proposal: This Saturday at 14:00',
      createdAt: ago(3),
    },
    {
      id: randomUUID(),
      tradeId: t3Id,
      senderId: userId,
      sender: currentUser,
      text: '✅ Meeting time agreed: This Saturday at 14:00',
      createdAt: ago(2),
    },
    {
      id: randomUUID(),
      tradeId: t4Id,
      senderId: partner3.id,
      sender: partner3,
      text: 'Sent the book! Tracking number shared.',
      createdAt: ago(60),
    },
    {
      id: randomUUID(),
      tradeId: t4Id,
      senderId: userId,
      sender: currentUser,
      text: 'Received the package, the book is in mint condition!',
      createdAt: ago(50),
    },
    {
      id: randomUUID(),
      tradeId: t4Id,
      senderId: partner3.id,
      sender: partner3,
      text: 'Thanks for the trade! Books received, swap completed smoothly 👍',
      createdAt: ago(48),
    },
  ];

  return { trades, messages };
};

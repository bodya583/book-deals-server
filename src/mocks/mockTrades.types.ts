import type { MockBook, MockUser } from './mockBooks.types.js';

export interface MockTradeItem {
  id: string;
  bookId: string;
  side: 'OFFERED' | 'REQUESTED';
  book: MockBook;
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

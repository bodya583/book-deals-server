import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';

export const computeSimpleHash = (str: string): string => {
  let hash = 0;
  const s = str.trim().toLowerCase();
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
};

// Sort book IDs alphabetically and compute a hash so that selection order does not matter
export const computeBooksHash = (offeredIds: string[] = [], targetIds: string[] = []): string => {
  const sortedOffered = [...offeredIds].sort().join(',');
  const sortedTarget = [...targetIds].sort().join(',');
  const rawKey = `give:[${sortedOffered}]|get:[${sortedTarget}]`;
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    hash = (hash << 5) - hash + rawKey.charCodeAt(i);
    hash |= 0;
  }
  return `bh_${Math.abs(hash)}`;
};

export const validateSelfTrade = (senderId: string, receiverId: string): void => {
  if (!receiverId) {
    throw new BadRequestError('Trade partner is required');
  }
  if (receiverId === senderId) {
    throw new BadRequestError('Cannot create a trade offer with yourself');
  }
};

export const validateTradePayload = (offerBookIds: string[] = [], targetBookIds: string[] = []): void => {
  if (offerBookIds.length === 0 && targetBookIds.length === 0) {
    throw new BadRequestError('Select at least one book to offer or request');
  }
};

export interface BookOwnershipItem {
  id: string;
  userId: string | null;
  isForTrade?: boolean;
}

export const validateBookOwnership = (
  senderId: string,
  receiverId: string,
  offerBookIds: string[],
  targetBookIds: string[],
  books: BookOwnershipItem[]
): void => {
  const bookMap = new Map<string, BookOwnershipItem>(books.map((b) => [b.id, b]));

  for (const bookId of offerBookIds) {
    const book = bookMap.get(bookId);
    if (!book) {
      throw new NotFoundError(`Offered book (${bookId}) was not found`);
    }
    if (!book.userId || book.userId !== senderId) {
      throw new ForbiddenError(`You do not own the offered book: ${bookId}`);
    }
  }

  for (const bookId of targetBookIds) {
    const book = bookMap.get(bookId);
    if (!book) {
      throw new NotFoundError(`Requested book (${bookId}) was not found`);
    }
    if (!book.userId || book.userId !== receiverId) {
      throw new ForbiddenError(`Requested book (${bookId}) does not belong to the trade partner`);
    }
    if (book.isForTrade === false) {
      throw new BadRequestError(`Requested book (${bookId}) is not open for trade by its owner`);
    }
  }
};

export interface TradeActorShape {
  senderId: string;
  receiverId: string;
  status: string;
}

export function assertTradeExists<T>(trade: T | null | undefined, message = 'Trade not found'): asserts trade is T {
  if (!trade) {
    throw new NotFoundError(message);
  }
}

export const assertTradeParticipant = (
  trade: Pick<TradeActorShape, 'senderId' | 'receiverId'>,
  userId: string,
  message = 'You do not have access to this trade'
): void => {
  if (trade.senderId !== userId && trade.receiverId !== userId) {
    throw new ForbiddenError(message);
  }
};

export const assertPendingRecipientAction = (
  trade: TradeActorShape,
  userId: string,
  action: 'accept' | 'reject'
): void => {
  if (trade.receiverId !== userId) {
    throw new ForbiddenError(
      action === 'accept'
        ? 'Only the trade recipient can accept this offer'
        : 'Only the recipient can reject a trade'
    );
  }
  if (trade.status !== 'PENDING') {
    throw new ConflictError(`Cannot ${action} a trade with status "${trade.status}"`);
  }
};

export const assertPendingSenderCancel = (trade: TradeActorShape, userId: string): void => {
  if (trade.senderId !== userId) {
    throw new ForbiddenError('Only the offer creator can cancel this trade');
  }
  if (trade.status !== 'PENDING') {
    throw new ConflictError(`Cannot cancel a trade with status "${trade.status}"`);
  }
};

export const assertCompletableTrade = (trade: TradeActorShape, userId: string): void => {
  assertTradeParticipant(trade, userId, 'You do not have permission to complete this trade');
  if (trade.status !== 'AGREED' && trade.status !== 'ACCEPTED') {
    throw new ConflictError(`Only an agreed trade can be completed (current: "${trade.status}")`);
  }
};

export const validateCounterOffer = (
  oldTrade: TradeActorShape & { items?: { bookId: string; side: string }[] },
  userId: string,
  offerBookIds: string[],
  targetBookIds: string[]
): string => {
  assertTradeParticipant(oldTrade, userId, 'You do not have permission to modify this trade');
  if (oldTrade.status !== 'PENDING') {
    throw new ConflictError(`Cannot modify a trade with status "${oldTrade.status}"`);
  }

  const targetPartnerId = oldTrade.senderId === userId ? oldTrade.receiverId : oldTrade.senderId;
  validateSelfTrade(userId, targetPartnerId);

  const items = oldTrade.items || [];
  const oldOffered = items
    .filter((i) => (oldTrade.senderId === userId ? i.side === 'OFFERED' : i.side === 'REQUESTED'))
    .map((i) => i.bookId);
  const oldTarget = items
    .filter((i) => (oldTrade.senderId === userId ? i.side === 'REQUESTED' : i.side === 'OFFERED'))
    .map((i) => i.bookId);

  if (computeBooksHash(oldOffered, oldTarget) === computeBooksHash(offerBookIds, targetBookIds)) {
    throw new BadRequestError('Book selection is unchanged. Modify the books to send a counter offer');
  }

  return targetPartnerId;
};

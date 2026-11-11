import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';

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

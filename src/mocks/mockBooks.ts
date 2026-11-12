export type { MockBook, MockGenre, MockSettlement, MockUser } from './mockBooks.types.js';
export { MOCK_USERS } from './mockUsers.js';
export { MOCK_GENRES, findGenre, createMockGenre } from './mockGenres.js';
export {
  inMemoryBooks,
  getAllMockBooks,
  getMockBookById,
  getMockBookDetails,
  createMockBook,
  updateMockBook,
  deleteMockBook,
  getMockGenres,
  getMockSettlements,
} from './mockBooks.query.js';

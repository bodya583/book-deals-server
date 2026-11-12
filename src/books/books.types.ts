export interface CreateBookDto {
  title: string;
  author: string;
  description?: string;
  coverURL?: string;
  language?: string;
  year?: number | null;
  genres?: string[];
  userId?: string;
  isForTrade?: boolean;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  description?: string;
  coverURL?: string;
  language?: string;
  year?: number | null;
  genres?: string[];
  userId?: string;
  isForTrade?: boolean;
}

export type BookSortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'distance' | 'popular';

export interface GetBooksFilter {
  search?: string;
  userId?: string;
  isForTrade?: boolean;
  genre?: string;
  genres?: string[];
  strictGenres?: boolean;
  language?: string;
  languages?: string[];
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  limit?: number;
  sortBy?: BookSortOption;
  nearLat?: number;
  nearLng?: number;
  radius?: number;
  city?: string;
  cities?: string[];
}

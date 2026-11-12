export interface MockGenre {
  id: string;
  name: string;
}

export interface MockUser {
  id: string;
  username: string;
  photoURL?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
}

export interface MockBook {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverURL: string | null;
  language: string | null;
  year: number | null;
  genres: MockGenre[];
  userId: string | null;
  isForTrade?: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: MockUser | null;
}

export interface MockSettlement {
  name: string;
  count: number;
  latitude: number;
  longitude: number;
}

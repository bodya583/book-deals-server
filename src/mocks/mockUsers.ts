import type { MockUser } from './mockBooks.types.js';
import { SEED_USERS_WITH_HASH } from './catalog/seed1000Data.js';

export const MOCK_USERS: MockUser[] = [
  {
    id: 'u-1',
    username: 'alex_reader',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    latitude: 50.5015,
    longitude: 30.4982,
    city: 'Kyiv',
  },
  ...SEED_USERS_WITH_HASH.filter(u => u.username !== 'alex_reader').map((u) => ({
    id: u.id,
    username: u.username,
    photoURL: u.photoURL,
    latitude: u.latitude,
    longitude: u.longitude,
    city: u.city,
  })),
];

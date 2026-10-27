import { prisma } from '../index.js';
import { isMockMode } from '../config/env.js';
import { MOCK_USERS } from '../mocks/mockBooks.js';

export const updateLocation = async (userId: string, latitude: number, longitude: number) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { latitude, longitude },
    select: {
      id: true,
      username: true,
      email: true,
      photoURL: true,
      latitude: true,
      longitude: true,
      city: true,
      createdAt: true,
    },
  });
  return user;
};

export const clearLocation = async (userId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { latitude: null, longitude: null },
    select: {
      id: true,
      username: true,
      email: true,
      photoURL: true,
      latitude: true,
      longitude: true,
      city: true,
      createdAt: true,
    },
  });
  return user;
};

export const getProfile = async (userId: string) => {
  if (isMockMode) {
    const mockUser = MOCK_USERS.find((u) => u.id === userId);
    if (mockUser) {
      return {
        id: mockUser.id,
        username: mockUser.username,
        email: `${mockUser.username}@example.com`,
        photoURL: mockUser.photoURL || null,
        latitude: mockUser.latitude || null,
        longitude: mockUser.longitude || null,
        city: mockUser.city || null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      photoURL: true,
      latitude: true,
      longitude: true,
      city: true,
      createdAt: true,
    },
  });
  if (!user) throw new Error('User not found');
  return user;
};

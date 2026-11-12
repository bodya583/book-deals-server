import { prisma } from '../index.js';
import { isMockMode } from '../config/env.js';
import { MOCK_USERS, inMemoryBooks } from '../mocks/mockBooks.js';
import { inMemoryRegisteredUsers } from '../auth/auth.service.js';

export const updateLocation = async (userId: string, latitude: number, longitude: number) => {
  if (isMockMode) {
    let mockUser = MOCK_USERS.find((u) => u.id === userId);
    const regUser = inMemoryRegisteredUsers.find((u) => u.id === userId);

    if (regUser) {
      regUser.latitude = latitude;
      regUser.longitude = longitude;
    }

    if (!mockUser) {
      mockUser = {
        id: userId,
        username: regUser?.username || (userId.startsWith('mock-u-') ? `user_${userId.slice(7)}` : userId),
        photoURL: regUser?.photoURL || null,
        latitude,
        longitude,
        city: regUser?.city || 'Kyiv',
      };
      MOCK_USERS.push(mockUser);
    } else {
      mockUser.latitude = latitude;
      mockUser.longitude = longitude;
    }

    for (const b of inMemoryBooks) {
      if (b.userId === userId && b.user) {
        b.user.latitude = latitude;
        b.user.longitude = longitude;
      }
    }

    return {
      id: mockUser.id,
      username: mockUser.username,
      email: regUser?.email || `${mockUser.username}@example.com`,
      photoURL: mockUser.photoURL || null,
      latitude: mockUser.latitude ?? null,
      longitude: mockUser.longitude ?? null,
      city: mockUser.city || null,
      createdAt: regUser?.createdAt || new Date('2024-01-01T00:00:00.000Z'),
    };
  }

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
  if (isMockMode) {
    const mockUser = MOCK_USERS.find((u) => u.id === userId);
    const regUser = inMemoryRegisteredUsers.find((u) => u.id === userId);

    if (regUser) {
      regUser.latitude = null;
      regUser.longitude = null;
    }

    if (mockUser) {
      mockUser.latitude = null;
      mockUser.longitude = null;
    }

    for (const b of inMemoryBooks) {
      if (b.userId === userId && b.user) {
        b.user.latitude = null;
        b.user.longitude = null;
      }
    }

    const user = mockUser || regUser || {
      id: userId,
      username: userId.startsWith('mock-u-') ? `user_${userId.slice(7)}` : userId,
      photoURL: null,
      latitude: null,
      longitude: null,
      city: 'Kyiv',
    };

    return {
      id: user.id,
      username: user.username,
      email: regUser?.email || `${user.username}@example.com`,
      photoURL: user.photoURL || null,
      latitude: null,
      longitude: null,
      city: user.city || null,
      createdAt: regUser?.createdAt || new Date('2024-01-01T00:00:00.000Z'),
    };
  }

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
    const regUser = inMemoryRegisteredUsers.find((u) => u.id === userId);
    if (regUser) {
      return {
        id: regUser.id,
        username: regUser.username,
        email: regUser.email,
        photoURL: regUser.photoURL || null,
        latitude: regUser.latitude ?? null,
        longitude: regUser.longitude ?? null,
        city: regUser.city || null,
        createdAt: regUser.createdAt,
      };
    }

    let mockUser = MOCK_USERS.find((u) => u.id === userId);
    if (!mockUser) {
      mockUser = {
        id: userId,
        username: userId.startsWith('mock-u-') ? `user_${userId.slice(7)}` : userId,
        photoURL: null,
        latitude: null,
        longitude: null,
        city: 'Kyiv',
      };
      MOCK_USERS.push(mockUser);
    }

    return {
      id: mockUser.id,
      username: mockUser.username,
      email: `${mockUser.username}@example.com`,
      photoURL: mockUser.photoURL || null,
      latitude: mockUser.latitude ?? null,
      longitude: mockUser.longitude ?? null,
      city: mockUser.city || null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    };
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

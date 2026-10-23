import { prisma } from '../index.js';

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
      createdAt: true,
    },
  });
  return user;
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      photoURL: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    },
  });
  if (!user) throw new Error('User not found');
  return user;
};

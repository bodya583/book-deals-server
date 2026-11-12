import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { isMockMode } from '../config/env.js';
import { MOCK_USERS } from '../mocks/mockBooks.js';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '15d';

export interface TokenPayload {
  userId: string;
  email: string;
}

// In-memory registered users for mock mode
export const inMemoryRegisteredUsers: Array<{
  id: string;
  username: string;
  email: string;
  password?: string;
  photoURL: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  createdAt: Date;
}> = [];

export const generateTokens = (payload: TokenPayload) => {
  const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'mock_access_secret_key_1234567890123456';
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mock_refresh_secret_key_1234567890123456';
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'mock_access_secret_key_1234567890123456';
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mock_refresh_secret_key_1234567890123456';
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};

export const register = async (username: string, email: string, password: string) => {
  if (isMockMode) {
    const emailTaken =
      inMemoryRegisteredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      MOCK_USERS.some((u) => `${u.username}@example.com`.toLowerCase() === email.toLowerCase());
    if (emailTaken) {
      throw new Error('Email is already taken');
    }

    const usernameTaken =
      inMemoryRegisteredUsers.some((u) => u.username.toLowerCase() === username.toLowerCase()) ||
      MOCK_USERS.some((u) => u.username.toLowerCase() === username.toLowerCase());
    if (usernameTaken) {
      throw new Error('Username is already taken');
    }

    const newUser = {
      id: `mock-u-${randomUUID().slice(0, 8)}`,
      username,
      email,
      photoURL: null,
      latitude: 50.4501,
      longitude: 30.5234,
      city: 'Kyiv',
      createdAt: new Date(),
    };
    inMemoryRegisteredUsers.push(newUser);
    MOCK_USERS.push({
      id: newUser.id,
      username: newUser.username,
      photoURL: newUser.photoURL,
      latitude: newUser.latitude,
      longitude: newUser.longitude,
      city: newUser.city,
    });
    const tokens = generateTokens({ userId: newUser.id, email: newUser.email });
    return { user: newUser, ...tokens };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    throw new Error(existing.email === email ? 'Email is already taken' : 'Username is already taken');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: { id: true, username: true, email: true, photoURL: true, latitude: true, longitude: true, createdAt: true },
  });

  const tokens = generateTokens({ userId: user.id, email: user.email });

  return { user, ...tokens };
};

export const login = async (email: string, password: string) => {
  if (isMockMode) {
    // Check in-memory registered first
    const registered = inMemoryRegisteredUsers.find((u) => u.email === email || u.username === email);
    if (registered) {
      const tokens = generateTokens({ userId: registered.id, email: registered.email });
      return { user: registered, ...tokens };
    }

    // Match against predefined MOCK_USERS (e.g. alex_reader, olga_books or any email)
    const mockMatch = MOCK_USERS.find(
      (u) =>
        u.username.toLowerCase() === email.toLowerCase() ||
        `${u.username}@example.com`.toLowerCase() === email.toLowerCase()
    );

    const user = mockMatch || MOCK_USERS[0]; // fallback to first mock user (alex_reader)
    const userEmail = `${user.username}@example.com`;
    const tokens = generateTokens({ userId: user.id, email: userEmail });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: userEmail,
        photoURL: user.photoURL || null,
        latitude: user.latitude || null,
        longitude: user.longitude || null,
        city: user.city || null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      ...tokens,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const tokens = generateTokens({ userId: user.id, email: user.email });

  const { password: _, ...safeUser } = user;

  return { user: safeUser, ...tokens };
};

export const refresh = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  if (isMockMode) {
    const regUser = inMemoryRegisteredUsers.find((u) => u.id === payload.userId);
    if (regUser) {
      const tokens = generateTokens({ userId: regUser.id, email: regUser.email });
      return { user: regUser, ...tokens };
    }

    const mockUser = MOCK_USERS.find((u) => u.id === payload.userId) || MOCK_USERS[0];
    const userEmail = `${mockUser.username}@example.com`;
    const tokens = generateTokens({ userId: mockUser.id, email: userEmail });

    return {
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: userEmail,
        photoURL: mockUser.photoURL || null,
        latitude: mockUser.latitude || null,
        longitude: mockUser.longitude || null,
        city: mockUser.city || null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      ...tokens,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, email: true, photoURL: true, latitude: true, longitude: true, createdAt: true },
  });

  if (!user) throw new Error('User not found');

  const tokens = generateTokens({ userId: user.id, email: user.email });

  return { user, ...tokens };
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '15d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};

export const register = async (username: string, email: string, password: string) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    throw new Error(existing.email === email ? 'Email is already taken' : 'Username is already taken');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: { id: true, username: true, email: true, photoURL: true, createdAt: true },
  });

  const tokens = generateTokens({ userId: user.id, email: user.email });

  return { user, ...tokens };
};

export const login = async (email: string, password: string) => {
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

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, email: true, photoURL: true, createdAt: true },
  });

  if (!user) throw new Error('User not found');

  const tokens = generateTokens({ userId: user.id, email: user.email });

  return { user, ...tokens };
};
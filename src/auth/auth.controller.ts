import { Request, Response } from 'express';
import * as authService from './auth.service.js';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 15 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { user, accessToken, refreshToken } = await authService.register(username, email, password);

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);

    return res.status(201).json({ user, accessToken });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration error';
    return res.status(400).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);

    return res.status(200).json({ user, accessToken });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login error';
    return res.status(401).json({ message });
  }
};

export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const { user, accessToken, refreshToken } = await authService.refresh(token);

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);

    return res.status(200).json({ user, accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE);
  return res.status(200).json({ message: 'Logged out successfully' });
};
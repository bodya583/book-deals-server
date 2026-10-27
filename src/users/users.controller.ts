import { Request, Response } from 'express';
import * as usersService from './users.service.js';

/**
 * PATCH /api/users/me/location
 * Updates or sets the authenticated user's coordinates.
 * Body: { latitude: number, longitude: number }
 */
export const setLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { latitude, longitude } = req.body;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return res.status(400).json({
        message: 'latitude must be between -90 and 90, longitude between -180 and 180',
      });
    }

    const user = await usersService.updateLocation(userId, latitude, longitude);
    return res.status(200).json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating location';
    return res.status(500).json({ message });
  }
};

/**
 * DELETE /api/users/me/location
 * Clears the authenticated user's coordinates.
 */
export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await usersService.clearLocation(userId);
    return res.status(200).json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error clearing location';
    return res.status(500).json({ message });
  }
};

/**
 * GET /api/users/me
 * Returns the authenticated user's profile (including private location).
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await usersService.getProfile(userId);
    return res.status(200).json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching profile';
    return res.status(500).json({ message });
  }
};

/**
 * GET /api/users/:id
 * Returns public profile of any user.
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await usersService.getProfile(userId);
    return res.status(200).json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'User not found';
    return res.status(404).json({ message });
  }
};


import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// All user profile routes are protected
router.get('/me', authenticate, usersController.getMe);
router.patch('/me/location', authenticate, usersController.setLocation);
router.delete('/me/location', authenticate, usersController.deleteLocation);

export default router;

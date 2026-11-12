import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/me', authenticate, usersController.getMe);
router.get('/:id', usersController.getUserById);
router.patch('/me/location', authenticate, usersController.setLocation);
router.delete('/me/location', authenticate, usersController.deleteLocation);

export default router;

import { Router } from 'express';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/refresh', authController.refreshTokens);

router.post('/logout', authController.logout);

export default router;

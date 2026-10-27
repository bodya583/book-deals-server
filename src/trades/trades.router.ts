import { Router } from 'express';
import * as tradesController from './trades.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// All trade endpoints are protected by JWT authentication
router.use(authenticate);

router.get('/', tradesController.getAll);
router.get('/counts', tradesController.getCounts);
router.get('/partners', tradesController.getPartners);
router.get('/:id', tradesController.getById);

router.post('/', tradesController.create);
router.post('/:id/accept', tradesController.accept);
router.post('/:id/reject', tradesController.reject);
router.post('/:id/cancel', tradesController.cancel);
router.post('/:id/counter', tradesController.counter);
router.post('/:id/complete', tradesController.complete);
router.get('/:id/messages', tradesController.getMessages);
router.post('/:id/messages', tradesController.sendMessage);

export default router;

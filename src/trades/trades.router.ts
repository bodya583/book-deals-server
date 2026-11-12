import { Router } from 'express';
import * as tradesController from './trades.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createTradeSchema,
  counterTradeSchema,
  sendTradeMessageSchema,
  rejectTradeSchema,
  getTradesQuerySchema,
} from './trades.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: getTradesQuerySchema }), asyncHandler(tradesController.getAll));
router.get('/counts', asyncHandler(tradesController.getCounts));
router.get('/partners', asyncHandler(tradesController.getPartners));
router.get('/:id', asyncHandler(tradesController.getById));

router.post('/', validate({ body: createTradeSchema }), asyncHandler(tradesController.create));
router.post('/:id/accept', asyncHandler(tradesController.accept));
router.post('/:id/reject', validate({ body: rejectTradeSchema }), asyncHandler(tradesController.reject));
router.post('/:id/cancel', asyncHandler(tradesController.cancel));
router.post('/:id/counter', validate({ body: counterTradeSchema }), asyncHandler(tradesController.counter));
router.post('/:id/complete', asyncHandler(tradesController.complete));
router.get('/:id/messages', asyncHandler(tradesController.getMessages));
router.post('/:id/messages', validate({ body: sendTradeMessageSchema }), asyncHandler(tradesController.sendMessage));

export default router;

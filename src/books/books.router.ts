import { Router } from 'express';
import * as booksController from './books.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Public routes
router.get('/', booksController.getAll);
router.get('/:id/details', booksController.getDetails);
router.get('/:id', booksController.getById);

// Protected routes (require valid JWT)
router.post('/', authenticate, booksController.create);
router.put('/:id', authenticate, booksController.update);
router.delete('/:id', authenticate, booksController.remove);

export default router;

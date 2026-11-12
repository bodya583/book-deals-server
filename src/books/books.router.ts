import { Router } from 'express';
import * as booksController from './books.controller.js';
import * as genresController from '../genres/genres.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', booksController.getAll);
router.get('/genres', genresController.getAll);
router.get('/settlements', booksController.getSettlements);
router.get('/:id/details', booksController.getDetails);
router.get('/:id', booksController.getById);

router.post('/', authenticate, booksController.create);
router.put('/:id', authenticate, booksController.update);
router.patch('/:id', authenticate, booksController.update);
router.delete('/:id', authenticate, booksController.remove);

export default router;

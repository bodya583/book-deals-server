import { Router } from 'express';
import * as genresController from './genres.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', genresController.getAll);
router.post('/', authenticate, genresController.create);

export default router;

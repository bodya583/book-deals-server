import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { uploadSingleImage } from '../middleware/upload.js';
import * as uploadController from './upload.controller.js';

const router = Router();

router.post('/', authenticate, uploadSingleImage, uploadController.uploadImage);

export default router;

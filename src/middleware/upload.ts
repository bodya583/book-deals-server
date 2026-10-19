import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Use in-memory storage so buffers can be streamed straight to Cloudinary
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы изображений (JPEG, PNG, WEBP, GIF)'));
    }
  },
});

export const uploadSingleImage = (req: Request, res: Response, next: NextFunction) => {
  const single = upload.single('image');

  single(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Размер файла превышает допустимый предел (10 МБ)' });
      }
      return res.status(400).json({ message: `Ошибка загрузки файла: ${err.message}` });
    }
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

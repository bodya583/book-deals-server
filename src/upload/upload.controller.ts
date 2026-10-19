import { Request, Response } from 'express';
import { uploadImageToCloudinary } from './upload.service.js';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл изображения не был предоставлен' });
    }

    const result = await uploadImageToCloudinary(req.file.buffer, 'curse_books');

    return res.status(200).json({
      url: result.url,
      public_id: result.public_id,
      message: 'Изображение успешно загружено в Cloudinary',
    });
  } catch (err: unknown) {
    console.error('Cloudinary upload error:', err);
    const message = err instanceof Error ? err.message : 'Произошла ошибка при загрузке изображения';
    return res.status(500).json({ message });
  }
};

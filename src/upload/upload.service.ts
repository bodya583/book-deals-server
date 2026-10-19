import { Readable } from 'stream';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

export interface UploadResult {
  url: string;
  public_id: string;
}

export const uploadImageToCloudinary = async (
  buffer: Buffer,
  folder: string = 'curse_books'
): Promise<UploadResult> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Сервер Cloudinary не настроен. Пожалуйста, укажите переменные окружения CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY и CLOUDINARY_API_SECRET (или CLOUDINARY_URL) в server/.env'
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error: any, result) => {
        if (error) {
          const rawMsg = error.message || '';
          if (error.http_code === 403 || rawMsg.includes('403') || rawMsg.includes('permissions')) {
            return reject(
              new Error(
                'Cloudinary 403 Forbidden: у указанного API ключа нет разрешения на создание/загрузку файлов ("create"). В панели Cloudinary (Settings → Access Keys) включите для этого ключа разрешение "Upload / Media management" либо используйте основной Master API Key.'
              )
            );
          }
          return reject(new Error(rawMsg || 'Ошибка загрузки в Cloudinary'));
        }
        if (!result) {
          return reject(new Error('Cloudinary не вернул результат загрузки'));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

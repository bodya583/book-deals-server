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
      'Cloudinary server is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in server/.env'
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
                'Cloudinary 403 Forbidden: the provided API key does not have permission to create/upload files. In Cloudinary Settings -> Access Keys, enable "Upload / Media management" permission or use the Master API Key.'
              )
            );
          }
          return reject(new Error(rawMsg || 'Cloudinary upload error'));
        }
        if (!result) {
          return reject(new Error('Cloudinary did not return an upload result'));
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

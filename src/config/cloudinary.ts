import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = (): boolean => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
      secure: true,
    });
    return true;
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }

  return false;
};

export const isCloudinaryConfigured = (): boolean => {
  return configureCloudinary();
};

// Initial configuration attempt
configureCloudinary();

export default cloudinary;

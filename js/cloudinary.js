// Cloudinary Image Upload Helper
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './firebase-config.js';

/**
 * Upload an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export async function uploadImage(file) {
  if (!file) throw new Error('No file provided');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image too large. Max 5MB.');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'spec-interior/products');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Delete an image from Cloudinary (requires server-side for signed requests)
 * For now, we just remove the reference from our database
 */
export function getPublicIdFromUrl(url) {
  if (!url) return null;
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;
  const pathWithExt = parts[1].replace(/^v\d+\//, '');
  return pathWithExt.replace(/\.[^.]+$/, '');
}

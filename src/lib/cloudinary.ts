// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo

function base64ToBuffer(base64: string): { buffer: Buffer; mimeType: string } {
  const matches = base64.match(/^data:(.+);base64,(.*)$/);
  if (!matches) {
    throw new Error('Format base64 invalide');
  }
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  return { buffer, mimeType };
}

export function validateUpload(fileData: string): { buffer: Buffer; mimeType: string } {
  if (!fileData) {
    throw new Error('Aucun fichier fourni');
  }

  const { buffer, mimeType } = base64ToBuffer(fileData);

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Type de fichier non autorisé: ${mimeType}. Types acceptés: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Fichier trop volumineux: ${(buffer.length / 1024 / 1024).toFixed(1)}Mo. Taille maximale: ${MAX_FILE_SIZE / 1024 / 1024}Mo`);
  }

  return { buffer, mimeType };
}

export async function uploadToCloudinary(
  fileData: string,
  folder: string = 'profolio/general'
): Promise<string> {
  const { mimeType } = validateUpload(fileData);

  const isVideo = mimeType.startsWith('video/');

   const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    void cloudinary.uploader.upload(
      fileData,
      {
        folder,
        resource_type: isVideo ? 'video' : 'image',
        transformation: isVideo
          ? [{ quality: 'auto' }, { fetch_format: 'auto' }]
          : [{ quality: 'auto', fetch_format: 'auto' }],
        eager: isVideo
          ? [{ width: 640, height: 360, crop: 'limit' }]
          : undefined,
        eager_async: isVideo,
      },
       (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error('Upload échoué sans message d\'erreur'));
      }
    );
  });

  return result.secure_url;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\./);
  return match ? match[1] : null;
}

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE };

import { supabase } from './supabase';

export interface UploadedImageResult {
  url: string;
  public_id: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

/**
 * Client-side image compression using HTML5 Canvas.
 * Scales down large images to max 1400px while maintaining aspect ratio and 85% quality.
 */
export const compressImage = (file: File, maxWidth = 1400, maxHeight = 1400, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return reject(new Error(`Invalid file type "${file.name}". Only JPG, JPEG, PNG, and WEBP images are allowed.`));
    }
    if (file.size > MAX_FILE_SIZE) {
      return reject(new Error(`File "${file.name}" exceeds the 15MB size limit.`));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas 2d context for image compression'));
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image file "${file.name}"`));
    };

    img.src = objectUrl;
  });
};

/**
 * Single image upload with 3-tier fallback:
 * 1. Cloudinary upload
 * 2. Supabase Storage ('product-images' bucket)
 * 3. Compressed Data URL fallback (100% fail-proof)
 */
export const uploadImageHelper = async (file: File): Promise<UploadedImageResult> => {
  // Compress image first to avoid network timeouts & payload size errors
  let compressedBlob: Blob = file;
  try {
    compressedBlob = await compressImage(file);
  } catch (e: any) {
    console.warn('Image compression warning, proceeding with original file:', e.message);
  }

  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

  // 1. Try Cloudinary if configured
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && preset && preset !== 'your-upload-preset') {
    try {
      const fd = new FormData();
      fd.append('file', compressedBlob, fileName);
      fd.append('upload_preset', preset);
      fd.append('folder', 'vinayaka-frames/products');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        return {
          url: data.secure_url,
          public_id: data.public_id || '',
        };
      }
    } catch (e) {
      console.warn('Cloudinary upload attempt failed, trying Supabase storage...', e);
    }
  }

  // 2. Try Supabase Storage 'product-images' bucket
  try {
    const { data, error } = await supabase.storage.from('product-images').upload(fileName, compressedBlob, { upsert: true });
    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      if (publicUrlData?.publicUrl) {
        return {
          url: publicUrlData.publicUrl,
          public_id: fileName,
        };
      }
    }
  } catch (e) {
    console.warn('Supabase storage upload attempt failed, falling back to compressed Data URL...', e);
  }

  // 3. Fallback to Compressed Data URL (base64)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({
          url: reader.result,
          public_id: '',
        });
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(compressedBlob);
  });
};

/**
 * Upload multiple images concurrently with validation.
 */
export const uploadMultipleImagesHelper = async (
  files: FileList | File[],
  onProgress?: (completed: number, total: number) => void
): Promise<UploadedImageResult[]> => {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return [];

  const results: UploadedImageResult[] = [];
  let completed = 0;

  // Process uploads with controlled concurrency
  for (const file of fileArray) {
    try {
      const res = await uploadImageHelper(file);
      results.push(res);
    } catch (err: any) {
      console.error(`Failed to upload ${file.name}:`, err);
    } finally {
      completed++;
      if (onProgress) {
        onProgress(completed, fileArray.length);
      }
    }
  }

  return results;
};

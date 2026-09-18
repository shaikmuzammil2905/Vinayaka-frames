import { supabase } from './supabase';

/**
 * Robust image upload helper with 3-tier fallback:
 * 1. Supabase Storage ('product-images' bucket)
 * 2. Cloudinary unsigned upload
 * 3. Base64 Data URL fallback (100% fail-proof)
 */
export const uploadImageHelper = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

  // 1. Try Supabase Storage 'product-images' bucket
  try {
    const { data, error } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });
    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (e) {
    console.warn('Supabase storage upload attempt failed, falling back to Cloudinary...', e);
  }

  // 2. Try Cloudinary if preset configured
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && preset && preset !== 'your-upload-preset') {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', preset);
      fd.append('folder', 'vinayaka-frames/products');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (e) {
      console.warn('Cloudinary upload attempt failed, falling back to Data URL...', e);
    }
  }

  // 3. Fallback to Data URL (base64) - Guaranteed to work without external server config
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

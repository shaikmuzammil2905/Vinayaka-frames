import { supabase } from './supabase';

export interface UploadedVideoResult {
  url: string;
  public_id: string;
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

export const uploadVideoHelper = async (file: File, folder: string = 'videos'): Promise<UploadedVideoResult> => {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Invalid video file type. Allowed: MP4, WebM, OGG, MOV, AVI');
  }
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error('Video exceeds 100MB limit');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${safeName}`;

  // 1. Try Cloudinary video upload
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && preset && preset !== 'your-upload-preset') {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', preset);
      fd.append('folder', `vinayaka-frames/${folder}`);
      fd.append('resource_type', 'video');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.secure_url) {
        return { url: data.secure_url, public_id: data.public_id || '' };
      }
    } catch (e) {
      console.warn('Cloudinary video upload failed, trying Supabase storage...', e);
    }
  }

  // 2. Try Supabase Storage
  try {
    const bucketName = folder === 'reels' ? 'reels' : 'videos';
    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      if (urlData?.publicUrl) {
        return { url: urlData.publicUrl, public_id: fileName };
      }
    }
  } catch (e) {
    console.warn('Supabase storage video upload failed:', e);
  }

  throw new Error('Video upload failed. Please check your storage configuration or use a video URL instead.');
};

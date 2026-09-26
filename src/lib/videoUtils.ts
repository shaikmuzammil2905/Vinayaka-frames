import { supabase } from './supabase';

export interface UploadedVideoResult {
  url: string;
  public_id: string;
  thumbnailBlob?: Blob;
  thumbnailUrl?: string;
}

export type ProgressCallback = (percent: number, statusText: string) => void;

// Support up to 250MB practical large video files
const MAX_VIDEO_SIZE = 250 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/ogg',
  'video/x-msvideo', // .avi
  'video/3gpp',
  'video/m4v',
];

/**
 * Capture an ultra-clean video frame thumbnail directly in the browser
 */
export const captureVideoThumbnail = (file: File, atTime: number = 1): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const cleanUp = () => {
        URL.revokeObjectURL(objectUrl);
        video.remove();
      };

      video.onloadedmetadata = () => {
        const targetTime = Math.min(atTime, Math.max(0, video.duration / 2));
        video.currentTime = targetTime;
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 720;
          canvas.height = video.videoHeight || 1280;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanUp();
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            cleanUp();
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail blob'));
            }
          }, 'image/jpeg', 0.85);
        } catch (e) {
          cleanUp();
          reject(e);
        }
      };

      video.onerror = () => {
        cleanUp();
        reject(new Error('Failed to load video file for thumbnail generation'));
      };
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Upload thumbnail image blob to Supabase Storage ('product-images' bucket)
 */
export const uploadThumbnailBlob = async (blob: Blob, baseName: string): Promise<string | null> => {
  try {
    const fileName = `thumbs/${Date.now()}_${baseName.replace(/[^a-zA-Z0-9_-]/g, '')}.jpg`;
    const { data, error } = await supabase.storage.from('product-images').upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return urlData?.publicUrl || null;
    }
  } catch (e) {
    console.warn('Thumbnail storage upload note:', e);
  }
  return null;
};

/**
 * Direct browser-to-storage upload with real-time byte progress reporting
 */
export const uploadVideoHelper = async (
  file: File,
  folder: 'videos' | 'reels' = 'videos',
  onProgress?: ProgressCallback
): Promise<UploadedVideoResult> => {
  // 1. Validation
  const fileType = file.type.toLowerCase();
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const isAllowedExt = ['mp4', 'webm', 'mov', 'ogg', 'avi', '3gp', 'm4v'].includes(fileExt || '');

  if (!ALLOWED_VIDEO_TYPES.includes(fileType) && !isAllowedExt) {
    throw new Error(`Unsupported video format (${file.type || fileExt}). Supported: MP4, MOV, WebM, OGG, AVI, 3GP.`);
  }

  if (file.size > MAX_VIDEO_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Video file is ${sizeMb}MB, which exceeds the maximum supported size of 250MB.`);
  }

  onProgress?.(5, 'Preparing video upload...');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${safeName}`;
  const bucketName = folder === 'reels' ? 'reels' : 'videos';

  // 2. Generate video thumbnail in background
  let thumbnailBlob: Blob | undefined;
  let thumbnailUrl: string | undefined;
  try {
    thumbnailBlob = await captureVideoThumbnail(file, 1);
    if (thumbnailBlob) {
      const thumbUrl = await uploadThumbnailBlob(thumbnailBlob, safeName);
      if (thumbUrl) thumbnailUrl = thumbUrl;
    }
  } catch (thumbErr) {
    console.warn('Auto-thumbnail generation skipped:', thumbErr);
  }

  onProgress?.(15, 'Uploading video to storage...');

  // 3. Direct browser XHR upload to Supabase Storage with accurate byte progress
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fcyjbljpgdggmomlisxf.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Retrieve current active session if admin is logged in
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token || supabaseKey;

  const uploadViaXHR = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const rawPercent = (event.loaded / event.total) * 100;
          // Scale from 15% to 90%
          const scaledPercent = Math.min(92, Math.round(15 + rawPercent * 0.77));
          onProgress?.(scaledPercent, `Uploading: ${Math.round(rawPercent)}%`);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(95, 'Finalizing upload...');
          const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            resolve(publicUrlData.publicUrl);
          } else {
            resolve(`${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`);
          }
        } else {
          try {
            const errResponse = JSON.parse(xhr.responseText);
            if (xhr.status === 404 || errResponse.message?.includes('Bucket not found') || errResponse.error === 'Bucket not found') {
              reject(new Error(`Storage bucket '${bucketName}' does not exist yet. Please run migration 00006_storage_setup.sql in Supabase SQL editor.`));
              return;
            }
            if (xhr.status === 413 || errResponse.message?.includes('Payload too large')) {
              reject(new Error('Video exceeds storage plan size limit. Please compress the video or upgrade plan.'));
              return;
            }
            reject(new Error(errResponse.message || errResponse.error || `Upload failed (Status ${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed with HTTP status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during video upload. Please check your internet connection.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Video upload timed out. For large files, ensure a stable high-speed connection.'));
      };

      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('apikey', supabaseKey);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.setRequestHeader('x-upsert', 'true');
      xhr.timeout = 180000; // 3 minutes timeout for large files

      xhr.send(file);
    });
  };

  try {
    const publicUrl = await uploadViaXHR();
    onProgress?.(100, 'Upload complete ✓');
    return {
      url: publicUrl,
      public_id: fileName,
      thumbnailBlob,
      thumbnailUrl,
    };
  } catch (xhrError: any) {
    console.warn('XHR direct upload encountered an issue, trying standard Supabase client upload...', xhrError);
    // Fallback: standard Supabase SDK client upload
    try {
      const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
        upsert: true,
        contentType: file.type || 'video/mp4',
      });
      if (error) throw error;
      if (data) {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
        onProgress?.(100, 'Upload complete ✓');
        return {
          url: urlData.publicUrl,
          public_id: fileName,
          thumbnailBlob,
          thumbnailUrl,
        };
      }
    } catch (sdkError: any) {
      console.error('All video storage uploads failed:', sdkError);
      throw new Error(sdkError.message || xhrError.message || 'Video upload failed. Check Supabase storage bucket permissions.');
    }
  }

  throw new Error('Video upload failed. Please verify storage configuration.');
};

/**
 * Safely delete a video or media file from Supabase storage if it was hosted there
 */
export const deleteStorageMedia = async (mediaUrl: string, bucketFallback: string = 'videos'): Promise<boolean> => {
  if (!mediaUrl) return false;
  try {
    // Check if the URL points to our Supabase Storage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fcyjbljpgdggmomlisxf.supabase.co';
    if (!mediaUrl.includes(supabaseUrl) && !mediaUrl.includes('/storage/v1/object/public/')) {
      // External URL or Cloudinary, do not delete
      return false;
    }

    // Extract bucket and file path
    // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const match = mediaUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match) {
      const bucket = match[1];
      const filePath = decodeURIComponent(match[2]);
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) {
        console.warn(`Could not delete file ${filePath} from bucket ${bucket}:`, error);
        return false;
      }
      return true;
    }
  } catch (e) {
    console.warn('Storage cleanup warning:', e);
  }
  return false;
};

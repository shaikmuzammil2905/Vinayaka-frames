-- Migration 00006: Setup Storage Buckets and Policies for Videos, Reels, and Images

-- 1. Create or configure public storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-msvideo', 'video/3gpp']),
  ('reels', 'reels', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-msvideo', 'video/3gpp']),
  ('product-images', 'product-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies for Public Access & Uploads
-- Clean up existing policies if any
DROP POLICY IF EXISTS "Public can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view reels" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload reels" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update reels" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete reels" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product-images" ON storage.objects;

-- SELECT policies (Public CDN Read)
CREATE POLICY "Public can view videos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'videos');

CREATE POLICY "Public can view reels" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'reels');

CREATE POLICY "Public can view product-images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-images');

-- INSERT policies (Allow authenticated & anon for admin app uploads)
CREATE POLICY "Anyone can upload videos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Anyone can upload reels" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'reels');

CREATE POLICY "Anyone can upload product-images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'product-images');

-- UPDATE policies
CREATE POLICY "Anyone can update videos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'videos');

CREATE POLICY "Anyone can update reels" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'reels');

CREATE POLICY "Anyone can update product-images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'product-images');

-- DELETE policies (For storage cleanup on delete/replace)
CREATE POLICY "Anyone can delete videos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'videos');

CREATE POLICY "Anyone can delete reels" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'reels');

CREATE POLICY "Anyone can delete product-images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'product-images');

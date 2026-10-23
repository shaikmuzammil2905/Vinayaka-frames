-- Migration 00008: Dynamic Frame Styles and Customization Management
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS frame_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  thickness VARCHAR(50) NOT NULL DEFAULT '1 Inch',
  applicable_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  applicable_sizes TEXT,
  additional_price DECIMAL(10,2) DEFAULT 0.00,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE frame_styles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running
DROP POLICY IF EXISTS "Public can view active frame_styles" ON frame_styles;
DROP POLICY IF EXISTS "Authenticated full access to frame_styles" ON frame_styles;

-- Allow public read access to active, non-deleted frame styles
CREATE POLICY "Public can view active frame_styles" 
  ON frame_styles FOR SELECT 
  USING (is_active = true AND is_deleted = false);

-- Allow authenticated admins full CRUD access
CREATE POLICY "Authenticated full access to frame_styles" 
  ON frame_styles FOR ALL 
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_frame_styles_updated_at 
  BEFORE UPDATE ON frame_styles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Seed Default 1 Inch and 1.5 Inch Frame Styles
INSERT INTO frame_styles (name, image_url, thickness, display_order, is_active)
VALUES
  ('Classic Wood', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/20260918_162125.jpg.jpeg', '1 Inch', 1, true),
  ('Modern Black', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/20260918_162341.jpg.jpeg', '1 Inch', 2, true),
  ('Elegant Gold', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/20260918_162454.jpg.jpeg', '1 Inch', 3, true),
  ('Vintage Ornate', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/20260918_162618.jpg__1_.jpeg', '1 Inch', 4, true),
  ('Sleek White', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/20260918_162701.jpg__1_.jpeg', '1 Inch', 5, true),
  ('Premium Texture', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/20260918_163402.jpg.jpeg', '1 Inch', 6, true),
  ('Premium Beading', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/frame_1.5_1.jpg', '1.5 Inch', 7, true),
  ('Royal Gold', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/frame_1.5_2.jpg', '1.5 Inch', 8, true),
  ('Classic Brown', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/frame_1.5_3.jpg', '1.5 Inch', 9, true),
  ('Vintage Wood', 'https://fcyjbljpgdggmomlisxf.supabase.co/storage/v1/object/public/product-images/frames/frame_1.5_4.jpg', '1.5 Inch', 10, true)
ON CONFLICT DO NOTHING;

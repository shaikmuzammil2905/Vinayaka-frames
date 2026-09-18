-- Initial Schema Migration for Vinayaka Frames

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  image_url TEXT,
  cloudinary_public_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  reviews_count INTEGER DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount INTEGER,
  customizable BOOLEAN DEFAULT false,
  photo_upload BOOLEAN DEFAULT false,
  custom_name BOOLEAN DEFAULT false,
  custom_message BOOLEAN DEFAULT false,
  stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Product Images Table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Product Sizes (For FRAME_SIZES and LED_FRAME_SIZES)
CREATE TABLE product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_led BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Product Finishes
CREATE TABLE product_finishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  finish_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Site Settings Table (Key-Value or JSON store for global content)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Site Settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('hero', '{"heading": "Capture Your Best Moments", "subtitle": "Premium quality personalized photo frames.", "button_text": "Shop Now", "hero_image": "", "hero_image_public_id": ""}'::jsonb),
('contact', '{"phone": "+91 93982 77441", "whatsapp": "919398277441", "email": "info@vinayakaframes.com", "address": "India"}'::jsonb),
('social', '{"instagram": "", "facebook": "", "youtube": ""}'::jsonb),
('footer', '{"text": "Vinayaka Frames - Quality You Can Trust", "copyright": "© 2026 Vinayaka Frames. All rights reserved."}'::jsonb),
('banner', '{"show": true, "text": "Free Shipping All Over India on Orders Above ₹999!"}'::jsonb);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all active content
CREATE POLICY "Allow public read-only access to categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Allow public read-only access to products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Allow public read-only access to product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to product_sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to product_finishes" ON product_finishes FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to approved reviews" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Allow public read-only access to site_settings" ON site_settings FOR SELECT USING (true);

-- Allow authenticated admins to do everything (assuming admin user is authenticated via Supabase Auth)
CREATE POLICY "Allow authenticated users full access to categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to product_images" ON product_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to product_sizes" ON product_sizes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to product_finishes" ON product_finishes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

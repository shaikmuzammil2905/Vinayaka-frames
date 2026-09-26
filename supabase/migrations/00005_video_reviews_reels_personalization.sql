-- Migration: Video Reviews, Reels, and Dynamic Personalization Fields

CREATE TABLE IF NOT EXISTS personalization_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL DEFAULT 'text',
  placeholder TEXT,
  help_text TEXT,
  options TEXT,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_video_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  review_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE personalization_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_video_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active personalization_fields" ON personalization_fields FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active customer_video_reviews" ON customer_video_reviews FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active reels" ON reels FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated full access to personalization_fields" ON personalization_fields FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access to customer_video_reviews" ON customer_video_reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access to reels" ON reels FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER update_personalization_fields_updated_at BEFORE UPDATE ON personalization_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_video_reviews_updated_at BEFORE UPDATE ON customer_video_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reels_updated_at BEFORE UPDATE ON reels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_personalization_fields_product_id ON personalization_fields(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_video_reviews_is_active ON customer_video_reviews(is_active);
CREATE INDEX IF NOT EXISTS idx_reels_is_active ON reels(is_active);

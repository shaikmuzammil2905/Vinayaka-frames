-- Seed Data Migration for Vinayaka Frames
-- Run this in Supabase SQL Editor after 00001_initial_schema.sql

-- Insert Categories
INSERT INTO categories (name, slug, image_url, active) VALUES
('God Frames', 'god-frames', 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('No-Edit Frames', 'no-edit-frames', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('Birthday Frames', 'birthday-frames', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('Wedding Frames', 'wedding-frames', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('Baby Frames', 'baby-frames', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('Death Frames', 'death-frames', 'https://images.unsplash.com/photo-1478147427282-58a87a120781?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('Collage Frames', 'collage-frames', 'https://images.unsplash.com/photo-1507608158173-1dcec673a2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('Mosaic Frames', 'mosaic-frames', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('Oil Painting', 'oil-painting', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true),
('Personalized Gifts', 'personalized-gifts', 'https://images.unsplash.com/photo-1512909006721-3d6018887383?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Products with Categories linked
DO $$
DECLARE
  cat_wedding UUID;
  cat_baby UUID;
  cat_gifts UUID;
  cat_collage UUID;
  cat_mosaic UUID;
  cat_god UUID;
  p_id UUID;
BEGIN
  SELECT id INTO cat_wedding FROM categories WHERE slug = 'wedding-frames' LIMIT 1;
  SELECT id INTO cat_baby FROM categories WHERE slug = 'baby-frames' LIMIT 1;
  SELECT id INTO cat_gifts FROM categories WHERE slug = 'personalized-gifts' LIMIT 1;
  SELECT id INTO cat_collage FROM categories WHERE slug = 'collage-frames' LIMIT 1;
  SELECT id INTO cat_mosaic FROM categories WHERE slug = 'mosaic-frames' LIMIT 1;
  SELECT id INTO cat_god FROM categories WHERE slug = 'god-frames' LIMIT 1;

  -- Product 1: Personalized Couple Frame
  INSERT INTO products (name, slug, category_id, description, rating, reviews_count, price, customizable, photo_upload, custom_name, custom_message, stock, is_best_seller, is_trending, active)
  VALUES ('Personalized Couple Frame', 'personalized-couple-frame', cat_wedding, 'A beautiful personalized frame to celebrate your love story. Perfect for weddings, anniversaries, or just to say "I love you". Comes with FREE gift packing.', 4.8, 124, 349, true, true, true, true, true, true, true, true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO p_id;

  INSERT INTO product_images (product_id, image_url, is_main) VALUES (p_id, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true);
  INSERT INTO product_sizes (product_id, size, price, is_led) VALUES
    (p_id, '8 × 12', 349, false), (p_id, '12 × 18', 549, false), (p_id, '16 × 24', 1299, false), (p_id, '20 × 30', 1699, false), (p_id, '24 × 36', 2449, false);
  INSERT INTO product_finishes (product_id, finish_type) VALUES
    (p_id, 'Glitter'), (p_id, 'Glossy'), (p_id, 'Matte'), (p_id, 'Fiber Glass / Acrylic'), (p_id, 'LED Lighting');

  -- Product 2: Baby Birth Frame
  INSERT INTO products (name, slug, category_id, description, rating, reviews_count, price, customizable, photo_upload, custom_name, custom_message, stock, is_best_seller, active)
  VALUES ('Personalized Baby Birth Frame', 'personalized-baby-birth-frame', cat_baby, 'Capture the precious details of your little one''s arrival with this adorable birth details frame.', 4.9, 86, 349, true, true, true, true, true, true, true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO p_id;

  INSERT INTO product_images (product_id, image_url, is_main) VALUES (p_id, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true);
  INSERT INTO product_sizes (product_id, size, price, is_led) VALUES
    (p_id, '8 × 12', 349, false), (p_id, '12 × 18', 549, false), (p_id, '16 × 24', 1299, false), (p_id, '20 × 30', 1699, false), (p_id, '24 × 36', 2449, false);
  INSERT INTO product_finishes (product_id, finish_type) VALUES
    (p_id, 'Glitter'), (p_id, 'Glossy'), (p_id, 'Matte'), (p_id, 'Fiber Glass / Acrylic'), (p_id, 'LED Lighting');

  -- Product 3: LED Heart Lamp
  INSERT INTO products (name, slug, category_id, description, rating, reviews_count, price, original_price, discount, customizable, photo_upload, custom_name, custom_message, stock, is_best_seller, is_trending, active)
  VALUES ('LED Heart Lamp', 'led-heart-lamp', cat_gifts, 'A glowing LED lamp in a beautiful heart shape. Personalize it with a special message.', 4.7, 42, 899, 1299, 30, true, true, false, true, true, true, true, true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO p_id;

  INSERT INTO product_images (product_id, image_url, is_main) VALUES (p_id, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true);

  -- Product 4: Custom Collage Frame
  INSERT INTO products (name, slug, category_id, description, rating, reviews_count, price, customizable, photo_upload, custom_name, custom_message, stock, is_new, active)
  VALUES ('Custom Collage Frame', 'custom-collage-frame', cat_collage, 'Combine up to 9 of your favorite memories in one stunning collage frame.', 4.6, 58, 349, true, true, false, false, true, true, true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO p_id;

  INSERT INTO product_images (product_id, image_url, is_main) VALUES (p_id, 'https://images.unsplash.com/photo-1507608158173-1dcec673a2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true);
  INSERT INTO product_sizes (product_id, size, price, is_led) VALUES
    (p_id, '8 × 12', 349, false), (p_id, '12 × 18', 549, false), (p_id, '16 × 24', 1299, false), (p_id, '20 × 30', 1699, false), (p_id, '24 × 36', 2449, false);
  INSERT INTO product_finishes (product_id, finish_type) VALUES
    (p_id, 'Glitter'), (p_id, 'Glossy'), (p_id, 'Matte'), (p_id, 'Fiber Glass / Acrylic'), (p_id, 'LED Lighting');

  -- Product 5: 3D Crystal Photo Cube
  INSERT INTO products (name, slug, category_id, description, rating, reviews_count, price, original_price, discount, customizable, photo_upload, custom_name, custom_message, stock, is_trending, active)
  VALUES ('3D Crystal Photo Cube', '3d-crystal-photo-cube', cat_gifts, 'Your 2D photo transformed into a mesmerizing 3D laser engraving inside a premium crystal cube.', 4.9, 112, 1099, 1499, 26, true, true, true, false, true, true, true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO p_id;

  INSERT INTO product_images (product_id, image_url, is_main) VALUES (p_id, 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true);

END $$;

-- Insert Sample Reviews
INSERT INTO reviews (customer_name, rating, content, approved) VALUES
('Priya Sharma', 5, 'The quality of the frames is absolutely stunning. I ordered a personalized collage frame for my anniversary and it exceeded all expectations. The packaging was also very secure.', true),
('Rahul Verma', 5, 'Amazing LED frames! I bought one for my best friend''s birthday. The light effect is beautiful and it makes for a perfect night lamp. Highly recommend Vinayak Frames.', true),
('Anjali Desai', 5, 'Very professional service and quick delivery. The finish on the wooden frames gives a very premium look to my living room wall. Will definitely order more.', true);

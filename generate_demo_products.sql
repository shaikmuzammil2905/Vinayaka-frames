-- Run this script in your Supabase SQL Editor to instantly generate demo products for every empty category!

DO $$
DECLARE
    cat RECORD;
    prod_id1 UUID;
    prod_id2 UUID;
BEGIN
    FOR cat IN SELECT * FROM categories LOOP
        -- Check if category already has products
        IF NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat.id) THEN
            
            -- Insert Premium Product
            prod_id1 := uuid_generate_v4();
            INSERT INTO products (id, name, slug, description, price, original_price, category_id, active, stock, is_new, is_trending)
            VALUES (
                prod_id1,
                'Premium ' || cat.name || ' Edition',
                'premium-' || cat.slug || '-' || floor(random() * 10000)::text,
                'This is a beautiful premium edition for ' || cat.name || '. Perfect for gifting and personal use.',
                999.00,
                1299.00,
                cat.id,
                true,
                true,
                true,
                true
            );

            -- Insert Images for Premium Product
            INSERT INTO product_images (product_id, image_url, is_main) VALUES
            (prod_id1, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),
            (prod_id1, 'https://images.unsplash.com/photo-1544253139-4cb5038ec673?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', false);

            -- Insert Classic Product
            prod_id2 := uuid_generate_v4();
            INSERT INTO products (id, name, slug, description, price, original_price, category_id, active, stock, is_best_seller)
            VALUES (
                prod_id2,
                'Classic ' || cat.name,
                'classic-' || cat.slug || '-' || floor(random() * 10000)::text,
                'Our classic style ' || cat.name || ' featuring timeless design and excellent build quality.',
                599.00,
                799.00,
                cat.id,
                true,
                true,
                true
            );

            -- Insert Images for Classic Product
            INSERT INTO product_images (product_id, image_url, is_main) VALUES
            (prod_id2, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),
            (prod_id2, 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', false);

        END IF;
    END LOOP;
END $$;

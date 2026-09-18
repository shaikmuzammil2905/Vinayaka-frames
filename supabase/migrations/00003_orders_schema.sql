-- 1. Create Sequence for Order Numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 10000;

-- 2. Create Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'COD',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  size VARCHAR(100),
  finish VARCHAR(100),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  personalization_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Function to generate order number automatically
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Format: VF-YYYY-XXXXX
  NEW.order_number := 'VF-' || to_char(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to attach order number before insert
CREATE TRIGGER before_insert_orders
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Allow authenticated users full access to orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');

-- Public users can't read/update/delete orders directly. They can only insert via the RPC function below (which uses security definer).

-- 6. RPC Function for Secure Order Placement
-- This function calculates the actual total on the server to prevent malicious client inputs.
CREATE OR REPLACE FUNCTION place_order(
  p_customer_name VARCHAR,
  p_customer_phone VARCHAR,
  p_customer_email VARCHAR,
  p_address TEXT,
  p_city VARCHAR,
  p_state VARCHAR,
  p_pincode VARCHAR,
  p_payment_method VARCHAR,
  p_items JSONB -- Array of { product_id, image, size, finish, quantity, personalization }
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product RECORD;
  v_size_price DECIMAL(10,2);
  v_unit_price DECIMAL(10,2);
  v_subtotal DECIMAL(10,2) := 0;
  v_is_led BOOLEAN;
BEGIN
  -- 1. Create the order draft
  INSERT INTO orders (
    customer_name, customer_phone, customer_email, address, city, state, pincode, payment_method, order_status
  ) VALUES (
    p_customer_name, p_customer_phone, p_customer_email, p_address, p_city, p_state, p_pincode, p_payment_method, 'Pending'
  ) RETURNING id INTO v_order_id;

  -- 2. Process each item and calculate price securely
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Fetch the base product to ensure it exists and gets its default price/name
    SELECT id, name, price, active INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID;
    
    IF v_product IS NULL OR v_product.active = false THEN
      RAISE EXCEPTION 'Product % is invalid or inactive', v_item->>'product_id';
    END IF;

    v_unit_price := v_product.price;
    v_is_led := (v_item->>'finish') = 'LED Lighting';

    -- If a size is provided, fetch its specific price
    IF v_item->>'size' IS NOT NULL AND v_item->>'size' != '' THEN
      SELECT price INTO v_size_price FROM product_sizes 
      WHERE product_id = v_product.id 
        AND REPLACE(LOWER(size), ' ', '') = REPLACE(LOWER(v_item->>'size'), ' ', '')
        AND is_led = v_is_led
      LIMIT 1;

      IF v_size_price IS NOT NULL THEN
        v_unit_price := v_size_price;
      ELSE
        -- Fallback: just fetch normal size price if LED match fails
        SELECT price INTO v_size_price FROM product_sizes 
        WHERE product_id = v_product.id 
          AND REPLACE(LOWER(size), ' ', '') = REPLACE(LOWER(v_item->>'size'), ' ', '')
        LIMIT 1;
        
        IF v_size_price IS NOT NULL THEN
          v_unit_price := v_size_price;
        END IF;
      END IF;
    END IF;

    -- Add to subtotal
    v_subtotal := v_subtotal + (v_unit_price * (v_item->>'quantity')::INTEGER);

    -- Insert order item
    INSERT INTO order_items (
      order_id, product_id, product_name, product_image, size, finish, quantity, unit_price, total_price, personalization_details
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_item->>'image',
      v_item->>'size',
      v_item->>'finish',
      (v_item->>'quantity')::INTEGER,
      v_unit_price,
      v_unit_price * (v_item->>'quantity')::INTEGER,
      v_item->'personalization'
    );
  END LOOP;

  -- 3. Update order totals
  -- Applying hardcoded business rules (Free shipping)
  UPDATE orders 
  SET 
    subtotal = v_subtotal,
    shipping_charge = 0.00,
    total_amount = v_subtotal
  WHERE id = v_order_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

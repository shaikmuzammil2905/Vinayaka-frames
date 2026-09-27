-- Migration: 00007_razorpay_live_fields.sql
-- Add Razorpay tracking and audit columns to orders table

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255),
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_failure_reason TEXT;

-- Index for fast lookups by razorpay_order_id
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);

-- Secure RPC to attach razorpay_order_id right after order creation
CREATE OR REPLACE FUNCTION set_razorpay_order_id(
  p_order_id UUID,
  p_razorpay_order_id VARCHAR
) RETURNS VOID AS $$
BEGIN
  UPDATE orders
  SET razorpay_order_id = p_razorpay_order_id,
      updated_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_razorpay_order_id TO anon;
GRANT EXECUTE ON FUNCTION set_razorpay_order_id TO authenticated;

-- Secure RPC to confirm payment after server-side HMAC signature verification
CREATE OR REPLACE FUNCTION confirm_razorpay_payment(
  p_order_id UUID,
  p_razorpay_order_id VARCHAR,
  p_razorpay_payment_id VARCHAR,
  p_razorpay_signature VARCHAR
) RETURNS VOID AS $$
BEGIN
  UPDATE orders
  SET 
    payment_status = 'Paid',
    order_status = 'Confirmed',
    razorpay_order_id = COALESCE(p_razorpay_order_id, razorpay_order_id),
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION confirm_razorpay_payment TO anon;
GRANT EXECUTE ON FUNCTION confirm_razorpay_payment TO authenticated;

-- Secure RPC to record payment failure
CREATE OR REPLACE FUNCTION record_payment_failure(
  p_order_id UUID,
  p_razorpay_order_id VARCHAR,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE orders
  SET 
    payment_status = 'Failed',
    razorpay_order_id = COALESCE(p_razorpay_order_id, razorpay_order_id),
    payment_failure_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION record_payment_failure TO anon;
GRANT EXECUTE ON FUNCTION record_payment_failure TO authenticated;

-- Update get_order_by_id RPC to include Razorpay fields
CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_order JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'customer_name', o.customer_name,
    'customer_phone', o.customer_phone,
    'customer_email', o.customer_email,
    'address', o.address,
    'city', o.city,
    'state', o.state,
    'pincode', o.pincode,
    'subtotal', o.subtotal,
    'discount', o.discount,
    'shipping_charge', o.shipping_charge,
    'total_amount', o.total_amount,
    'payment_method', o.payment_method,
    'payment_status', o.payment_status,
    'order_status', o.order_status,
    'razorpay_order_id', o.razorpay_order_id,
    'razorpay_payment_id', o.razorpay_payment_id,
    'paid_at', o.paid_at,
    'payment_failure_reason', o.payment_failure_reason,
    'awb_number', o.awb_number,
    'shipping_provider', o.shipping_provider,
    'tracking_url', o.tracking_url,
    'notes', o.notes,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'order_items', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'product_image', oi.product_image,
          'size', oi.size,
          'finish', oi.finish,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price,
          'personalization_details', oi.personalization_details
        )
      ) FROM order_items oi WHERE oi.order_id = o.id),
      '[]'::jsonb
    )
  ) INTO v_order
  FROM orders o
  WHERE o.id = p_order_id;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_order_by_id TO anon;
GRANT EXECUTE ON FUNCTION get_order_by_id TO authenticated;

-- Migration: Fix Order RLS & Permissions for Guest Checkout
-- Run this in Supabase SQL Editor

-- 1. Grant EXECUTE on place_order function to anon and authenticated roles
-- The function is SECURITY DEFINER so it will bypass RLS internally,
-- but the anon role still needs permission to CALL the function.
GRANT EXECUTE ON FUNCTION place_order TO anon;
GRANT EXECUTE ON FUNCTION place_order TO authenticated;

-- 2. Create a secure RPC for fetching a single order by ID
-- This allows the Order Success page to display order details
-- without giving anon users broad SELECT access to the orders table.
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

-- Grant execute on the new function
GRANT EXECUTE ON FUNCTION get_order_by_id TO anon;
GRANT EXECUTE ON FUNCTION get_order_by_id TO authenticated;

-- 3. Allow anonymous users to submit reviews (INSERT only)
-- They still cannot read unapproved reviews or update/delete.
CREATE POLICY "Allow anon insert reviews" ON reviews FOR INSERT WITH CHECK (true);

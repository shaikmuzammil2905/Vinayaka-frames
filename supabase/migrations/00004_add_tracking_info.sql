-- Add tracking information to the orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS awb_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_provider VARCHAR(100) DEFAULT 'Delhivery',
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- Update the comments or metadata if needed
COMMENT ON COLUMN orders.awb_number IS 'Air Waybill number for tracking shipments';
COMMENT ON COLUMN orders.shipping_provider IS 'The logistics partner used for shipping';
COMMENT ON COLUMN orders.tracking_url IS 'Direct link to track the shipment';

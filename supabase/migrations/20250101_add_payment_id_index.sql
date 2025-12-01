-- Add index on orders.payment_id for faster webhook idempotency checks
-- This index improves performance when checking for duplicate orders by payment_id
-- Run this migration in Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);

-- Verify the index was created
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'orders' AND indexname = 'idx_orders_payment_id';


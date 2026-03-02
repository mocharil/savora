-- Add transaction_token column to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_token TEXT;

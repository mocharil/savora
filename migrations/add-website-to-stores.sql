-- Add website column to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS website text;

-- Add comment for documentation
COMMENT ON COLUMN stores.website IS 'Store website URL (optional)';

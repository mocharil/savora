-- Daily Summaries table for caching AI-generated business summaries
-- Generated once per day per store to save AI token costs

CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,

  -- Core metrics (raw data)
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_items_sold INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,

  -- Order status breakdown
  pending_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,

  -- Payment breakdown
  paid_orders INTEGER DEFAULT 0,
  unpaid_orders INTEGER DEFAULT 0,

  -- Top performers (JSON)
  top_selling_items JSONB DEFAULT '[]',
  -- Format: [{"id": "uuid", "name": "Menu Name", "quantity": 10, "revenue": 150000}]

  peak_hours JSONB DEFAULT '[]',
  -- Format: [{"hour": 12, "orders": 15, "revenue": 500000}]

  -- AI-generated content
  ai_summary TEXT,
  -- Natural language summary of the day

  ai_insights JSONB DEFAULT '[]',
  -- Format: [{"type": "positive|negative|suggestion", "message": "..."}]

  ai_recommendations JSONB DEFAULT '[]',
  -- Format: [{"priority": "high|medium|low", "action": "...", "reason": "..."}]

  -- Comparison with previous day
  revenue_change_percent DECIMAL(5,2),
  orders_change_percent DECIMAL(5,2),

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint: one summary per store per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_summaries_store_date
ON daily_summaries(store_id, summary_date);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_daily_summaries_store_id
ON daily_summaries(store_id);

CREATE INDEX IF NOT EXISTS idx_daily_summaries_date
ON daily_summaries(summary_date DESC);

-- Disable RLS for simplicity (using service role key)
ALTER TABLE daily_summaries DISABLE ROW LEVEL SECURITY;

-- Comment
COMMENT ON TABLE daily_summaries IS 'Caches daily AI-generated business summaries to save token costs. Generated once per day via lazy loading.';

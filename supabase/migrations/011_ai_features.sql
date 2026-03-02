-- =============================================
-- AI FEATURES MIGRATION
-- Version: 011
-- Description: Add tables for AI-powered features
-- =============================================

-- 1. AI Insights Cache Table
-- Stores cached AI-generated insights to reduce API calls
CREATE TABLE IF NOT EXISTS ai_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  insights JSONB NOT NULL,
  data_hash VARCHAR(64), -- For cache invalidation
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_store ON ai_insights_cache(store_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_outlet ON ai_insights_cache(outlet_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights_cache(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires ON ai_insights_cache(expires_at);

-- 2. Sales Forecasts Table
-- Stores AI-generated sales predictions
CREATE TABLE IF NOT EXISTS sales_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  predicted_orders INTEGER,
  predicted_revenue DECIMAL(12,2),
  confidence_level DECIMAL(3,2), -- 0.00 to 1.00
  prediction_details JSONB, -- Detailed breakdown by category/time
  actual_orders INTEGER, -- Filled after the date passes
  actual_revenue DECIMAL(12,2),
  accuracy_score DECIMAL(5,2), -- Calculated after actual data
  model_version VARCHAR(20) DEFAULT 'v1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(store_id, outlet_id, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_store ON sales_forecasts(store_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_outlet ON sales_forecasts(outlet_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_date ON sales_forecasts(forecast_date);

-- 3. Pricing Recommendations Table
-- Stores AI-generated pricing suggestions
CREATE TABLE IF NOT EXISTS pricing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  current_price DECIMAL(10,2) NOT NULL,
  recommended_price DECIMAL(10,2) NOT NULL,
  price_change_percent DECIMAL(5,2),
  confidence_score DECIMAL(3,2),
  reasoning TEXT,
  estimated_impact JSONB, -- { revenue_change: 15, volume_change: -5, profit_change: 10 }
  factors JSONB, -- Array of factors that influenced the recommendation
  status VARCHAR(20) DEFAULT 'pending', -- pending, applied, rejected, expired
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_pricing_store ON pricing_recommendations(store_id);
CREATE INDEX IF NOT EXISTS idx_pricing_menu_item ON pricing_recommendations(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_status ON pricing_recommendations(status);

-- 4. Voice Orders Log Table
-- Logs voice order attempts for improvement
CREATE TABLE IF NOT EXISTS voice_orders_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  raw_transcript TEXT NOT NULL,
  parsed_items JSONB, -- Array of recognized items
  unrecognized_parts TEXT[], -- Parts that couldn't be parsed
  confidence_score DECIMAL(3,2),
  was_successful BOOLEAN DEFAULT false,
  was_confirmed BOOLEAN DEFAULT false,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- If order was created
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_log_store ON voice_orders_log(store_id);
CREATE INDEX IF NOT EXISTS idx_voice_log_outlet ON voice_orders_log(outlet_id);
CREATE INDEX IF NOT EXISTS idx_voice_log_success ON voice_orders_log(was_successful);
CREATE INDEX IF NOT EXISTS idx_voice_log_created ON voice_orders_log(created_at);

-- 5. AI Usage Analytics Table
-- Track AI feature usage for optimization
CREATE TABLE IF NOT EXISTS ai_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  feature_type VARCHAR(50) NOT NULL, -- 'insights', 'forecast', 'pricing', 'voice', 'chat', 'menu_creator'
  request_count INTEGER DEFAULT 1,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  was_successful BOOLEAN DEFAULT true,
  error_type VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_store ON ai_usage_analytics(store_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON ai_usage_analytics(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_analytics(created_at);

-- 6. Function to update sales_forecasts accuracy
CREATE OR REPLACE FUNCTION update_forecast_accuracy()
RETURNS TRIGGER AS $$
BEGIN
  -- Update forecasts with actual data when orders are completed
  UPDATE sales_forecasts sf
  SET
    actual_orders = subq.order_count,
    actual_revenue = subq.total_revenue,
    accuracy_score = CASE
      WHEN sf.predicted_revenue > 0 THEN
        (1 - ABS(subq.total_revenue - sf.predicted_revenue) / sf.predicted_revenue) * 100
      ELSE NULL
    END,
    updated_at = NOW()
  FROM (
    SELECT
      DATE(o.created_at) as order_date,
      o.store_id,
      o.outlet_id,
      COUNT(*) as order_count,
      SUM(o.total_amount) as total_revenue
    FROM orders o
    WHERE o.payment_status = 'paid'
      AND DATE(o.created_at) = DATE(NEW.created_at)
      AND o.store_id = NEW.store_id
    GROUP BY DATE(o.created_at), o.store_id, o.outlet_id
  ) subq
  WHERE sf.store_id = subq.store_id
    AND (sf.outlet_id = subq.outlet_id OR (sf.outlet_id IS NULL AND subq.outlet_id IS NULL))
    AND sf.forecast_date = subq.order_date
    AND sf.actual_orders IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update forecast accuracy when orders are paid
DROP TRIGGER IF EXISTS trigger_update_forecast_accuracy ON orders;
CREATE TRIGGER trigger_update_forecast_accuracy
  AFTER UPDATE OF payment_status ON orders
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid' AND OLD.payment_status != 'paid')
  EXECUTE FUNCTION update_forecast_accuracy();

-- 7. Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_ai_data()
RETURNS void AS $$
BEGIN
  -- Delete expired insights cache
  DELETE FROM ai_insights_cache WHERE expires_at < NOW();

  -- Mark expired pricing recommendations
  UPDATE pricing_recommendations
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();

  -- Delete old voice logs (older than 90 days)
  DELETE FROM voice_orders_log WHERE created_at < NOW() - INTERVAL '90 days';

  -- Delete old usage analytics (older than 365 days)
  DELETE FROM ai_usage_analytics WHERE created_at < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE ai_insights_cache IS 'Caches AI-generated business insights to reduce API calls';
COMMENT ON TABLE sales_forecasts IS 'Stores AI-predicted sales forecasts with accuracy tracking';
COMMENT ON TABLE pricing_recommendations IS 'AI-generated pricing suggestions for menu items';
COMMENT ON TABLE voice_orders_log IS 'Logs voice ordering attempts for accuracy improvement';
COMMENT ON TABLE ai_usage_analytics IS 'Tracks AI feature usage for optimization and billing';

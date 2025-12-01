-- =====================================================
-- AI FEATURE TABLES FOR SAVORA
-- =====================================================

-- 1. AI Insights Cache
-- Stores generated AI insights to reduce API calls
CREATE TABLE IF NOT EXISTS ai_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  insights JSONB NOT NULL,
  data_hash VARCHAR(64), -- for cache invalidation
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_store ON ai_insights_cache(store_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_outlet ON ai_insights_cache(outlet_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights_cache(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires ON ai_insights_cache(expires_at);

-- 2. Sales Forecasts
-- Stores predicted and actual sales for accuracy tracking
CREATE TABLE IF NOT EXISTS sales_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  predicted_orders INTEGER,
  predicted_revenue DECIMAL(12,2),
  confidence_level DECIMAL(3,2), -- 0.00 to 1.00
  factors JSONB, -- factors that influenced prediction
  actual_orders INTEGER, -- filled after the date passes
  actual_revenue DECIMAL(12,2),
  accuracy_score DECIMAL(5,2), -- calculated after actual data
  model_version VARCHAR(20) DEFAULT 'v1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(outlet_id, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_outlet_date ON sales_forecasts(outlet_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_forecasts_store ON sales_forecasts(store_id);

-- 3. Pricing Recommendations
-- AI-generated pricing suggestions
CREATE TABLE IF NOT EXISTS pricing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  current_price DECIMAL(10,2),
  recommended_price DECIMAL(10,2),
  change_percentage DECIMAL(5,2),
  reason TEXT,
  confidence DECIMAL(3,2),
  estimated_impact JSONB, -- { revenue_change: 15, volume_change: -5 }
  factors JSONB, -- analysis factors
  status VARCHAR(20) DEFAULT 'pending', -- pending, applied, rejected, expired
  applied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_store ON pricing_recommendations(store_id);
CREATE INDEX IF NOT EXISTS idx_pricing_menu_item ON pricing_recommendations(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_status ON pricing_recommendations(status);

-- 4. Voice Orders Log
-- For tracking and improving voice recognition
CREATE TABLE IF NOT EXISTS voice_orders_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  raw_transcript TEXT NOT NULL,
  parsed_items JSONB,
  final_items JSONB, -- after user confirmation/correction
  confidence_score DECIMAL(3,2),
  was_successful BOOLEAN DEFAULT false,
  was_corrected BOOLEAN DEFAULT false, -- user made changes
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_log_outlet ON voice_orders_log(outlet_id);
CREATE INDEX IF NOT EXISTS idx_voice_log_success ON voice_orders_log(was_successful);

-- 5. AI Usage Tracking
-- For monitoring AI feature usage and costs
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  feature VARCHAR(50) NOT NULL, -- 'insights', 'forecast', 'pricing', 'voice'
  tokens_used INTEGER,
  cost_estimate DECIMAL(10,4),
  response_time_ms INTEGER,
  was_cached BOOLEAN DEFAULT false,
  error_occurred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_store ON ai_usage_log(store_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON ai_usage_log(feature);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON ai_usage_log(created_at);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE ai_insights_cache IS 'Cached AI-generated business insights to reduce API calls';
COMMENT ON TABLE sales_forecasts IS 'AI predictions for future sales with accuracy tracking';
COMMENT ON TABLE pricing_recommendations IS 'AI-suggested price changes for menu items';
COMMENT ON TABLE voice_orders_log IS 'Log of voice order attempts for accuracy improvement';
COMMENT ON TABLE ai_usage_log IS 'Tracking of AI feature usage for monitoring and billing';

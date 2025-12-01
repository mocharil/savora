# Technical Roadmap - Savora AI Features

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         SAVORA ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Customer  │    │    Admin    │    │   AI Services       │  │
│  │   Ordering  │    │   Dashboard │    │                     │  │
│  │   ┌─────┐   │    │   ┌─────┐   │    │  ┌───────────────┐  │  │
│  │   │Voice│   │    │   │Stats│   │    │  │ Claude API    │  │  │
│  │   │Order│   │    │   │Cards│   │    │  │ (Insights,    │  │  │
│  │   └─────┘   │    │   └─────┘   │    │  │  Analysis)    │  │  │
│  │   ┌─────┐   │    │   ┌─────┐   │    │  └───────────────┘  │  │
│  │   │Menu │   │    │   │ AI  │   │    │  ┌───────────────┐  │  │
│  │   │List │   │    │   │Panel│   │    │  │ Forecast      │  │  │
│  │   └─────┘   │    │   └─────┘   │    │  │ Engine        │  │  │
│  └─────────────┘    └─────────────┘    │  └───────────────┘  │  │
│         │                  │            │  ┌───────────────┐  │  │
│         │                  │            │  │ Speech API    │  │  │
│         ▼                  ▼            │  │ (Voice Order) │  │  │
│  ┌────────────────────────────────────┐ │  └───────────────┘  │  │
│  │         Next.js API Routes          │ └─────────────────────┘  │
│  │  /api/ai/insights                   │          │              │
│  │  /api/ai/forecast                   │◄─────────┘              │
│  │  /api/ai/pricing                    │                         │
│  │  /api/ai/voice-parse                │                         │
│  └────────────────────────────────────┘                          │
│                    │                                              │
│                    ▼                                              │
│  ┌────────────────────────────────────┐                          │
│  │           Supabase                  │                          │
│  │  ┌──────────┐  ┌──────────────────┐│                          │
│  │  │ orders   │  │ ai_insights_cache││                          │
│  │  │ menu     │  │ forecasts        ││                          │
│  │  │ outlets  │  │ pricing_history  ││                          │
│  │  └──────────┘  └──────────────────┘│                          │
│  └────────────────────────────────────┘                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📦 New Database Tables

### 1. ai_insights_cache
```sql
CREATE TABLE ai_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  insights JSONB NOT NULL,
  data_hash VARCHAR(64), -- untuk cache invalidation
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_store ON ai_insights_cache(store_id);
CREATE INDEX idx_ai_insights_outlet ON ai_insights_cache(outlet_id);
CREATE INDEX idx_ai_insights_type ON ai_insights_cache(insight_type);
```

### 2. sales_forecasts
```sql
CREATE TABLE sales_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  predicted_orders INTEGER,
  predicted_revenue DECIMAL(12,2),
  confidence_level DECIMAL(3,2), -- 0.00 to 1.00
  actual_orders INTEGER, -- filled after the date passes
  actual_revenue DECIMAL(12,2),
  accuracy_score DECIMAL(5,2), -- calculated after actual data
  model_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(outlet_id, forecast_date)
);

CREATE INDEX idx_forecasts_outlet_date ON sales_forecasts(outlet_id, forecast_date);
```

### 3. pricing_recommendations
```sql
CREATE TABLE pricing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  current_price DECIMAL(10,2),
  recommended_price DECIMAL(10,2),
  reason TEXT,
  estimated_impact JSONB, -- { revenue_change: 15, volume_change: -5 }
  status VARCHAR(20) DEFAULT 'pending', -- pending, applied, rejected
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pricing_store ON pricing_recommendations(store_id);
CREATE INDEX idx_pricing_status ON pricing_recommendations(status);
```

### 4. voice_orders_log
```sql
CREATE TABLE voice_orders_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  raw_transcript TEXT,
  parsed_items JSONB,
  confidence_score DECIMAL(3,2),
  was_successful BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For improving voice recognition accuracy over time
CREATE INDEX idx_voice_log_outlet ON voice_orders_log(outlet_id);
```

---

## 🔌 API Endpoints Specification

### 1. POST /api/ai/insights

**Purpose:** Generate AI-powered business insights

**Request:**
```typescript
{
  outlet_id?: string;    // optional, for specific outlet
  period: 'daily' | 'weekly' | 'monthly';
  force_refresh?: boolean; // bypass cache
}
```

**Response:**
```typescript
{
  success: true,
  insights: {
    summary: string;           // "Minggu ini performa baik dengan kenaikan 15%"
    highlights: [
      {
        type: 'positive' | 'negative' | 'neutral';
        title: string;
        description: string;
        metric?: { value: number; change: number; unit: string };
        action?: string;       // recommended action
      }
    ];
    metrics: {
      total_revenue: number;
      total_orders: number;
      avg_order_value: number;
      revenue_change: number;  // percentage
      orders_change: number;
    };
    top_items: Array<{ name: string; quantity: number; revenue: number }>;
    peak_hours: Array<{ hour: number; orders: number }>;
    recommendations: string[];
  };
  generated_at: string;
  cached: boolean;
}
```

**Implementation Notes:**
- Cache insights for 1 hour to reduce API calls
- Use data hash to invalidate cache when new orders come in
- Fallback to basic stats if AI API fails

---

### 2. POST /api/ai/forecast

**Purpose:** Predict future sales

**Request:**
```typescript
{
  outlet_id: string;
  days_ahead: number;  // 1-14
}
```

**Response:**
```typescript
{
  success: true,
  forecasts: [
    {
      date: string;            // "2024-12-01"
      day_name: string;        // "Minggu"
      predicted_orders: number;
      predicted_revenue: number;
      confidence: number;      // 0.0 - 1.0
      factors: string[];       // ["Weekend biasanya ramai", "Hari libur"]
      stock_recommendations: [
        { item: string; current_stock: number; recommended: number }
      ]
    }
  ];
  model_accuracy: number;     // historical accuracy
  last_trained: string;
}
```

**Algorithm:**
1. Fetch last 30-90 days of order data
2. Calculate day-of-week patterns
3. Identify trends (growth/decline)
4. Factor in special dates (weekends, holidays)
5. Use Claude to interpret and add context

---

### 3. POST /api/ai/pricing

**Purpose:** Generate pricing recommendations

**Request:**
```typescript
{
  menu_item_id?: string;  // specific item, or all items if not provided
  outlet_id?: string;
}
```

**Response:**
```typescript
{
  success: true,
  recommendations: [
    {
      menu_item_id: string;
      name: string;
      current_price: number;
      recommended_price: number;
      change_percentage: number;
      confidence: number;
      reasoning: string;
      impact_estimate: {
        revenue_change_percent: number;
        volume_change_percent: number;
        profit_change_percent: number;
      };
      factors: [
        { factor: string; weight: number; direction: 'up' | 'down' }
      ]
    }
  ]
}
```

**Factors Considered:**
- Sales volume & velocity
- Price elasticity (if item has price history)
- Category benchmarks
- Competitor prices (if provided)
- Profit margins
- Time since last price change

---

### 4. POST /api/ai/voice-parse

**Purpose:** Parse voice transcript into order items

**Request:**
```typescript
{
  transcript: string;     // "nasi goreng dua es teh tiga"
  outlet_id: string;      // to match against menu
}
```

**Response:**
```typescript
{
  success: true,
  parsed: {
    items: [
      {
        menu_item_id: string;
        name: string;
        quantity: number;
        price: number;
        confidence: number;
        original_text: string;  // what part of transcript
      }
    ];
    unrecognized: string[];    // parts that couldn't be parsed
    total: number;
  };
  suggestions?: [              // if ambiguous
    { text: string; options: Array<{ name: string; id: string }> }
  ]
}
```

**Parsing Strategy:**
1. Normalize text (lowercase, remove filler words)
2. Extract quantity words (satu, dua, 2, dll)
3. Fuzzy match against menu items
4. Use Claude for complex/ambiguous orders
5. Return confidence scores for confirmation

---

## 🎨 UI Components to Build

### 1. AIInsightsCard Component

```typescript
// src/components/admin/ai/AIInsightsCard.tsx

interface AIInsightsCardProps {
  outletId?: string;
  period: 'daily' | 'weekly' | 'monthly';
}

// Features:
// - Auto-refresh every hour
// - Loading skeleton
// - Expandable insight items
// - Action buttons for recommendations
// - Animated metrics
```

**Design:**
```
┌─────────────────────────────────────────────────┐
│  🧠 AI Insights                    [Refresh]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  "Minggu ini penjualan naik 15% dibanding      │
│   minggu lalu. Menu terlaris adalah Nasi       │
│   Goreng Special dengan 45 porsi terjual."     │
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ ↑ 15%   │ │ 156     │ │ Rp 45K  │          │
│  │ Revenue │ │ Orders  │ │ Avg     │          │
│  └─────────┘ └─────────┘ └─────────┘          │
│                                                 │
│  📈 Highlights:                                 │
│  ├─ ✅ Nasi Goreng naik 30%                    │
│  ├─ ⚠️ Es Jeruk turun 20%                      │
│  └─ 💡 Tambah promo siang hari                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 2. SalesForecastChart Component

```typescript
// src/components/admin/ai/SalesForecastChart.tsx

interface SalesForecastChartProps {
  outletId: string;
  daysAhead?: number;
}

// Features:
// - Line chart with actual vs predicted
// - Confidence band visualization
// - Hover tooltips with details
// - Stock recommendation panel
```

**Design:**
```
┌─────────────────────────────────────────────────┐
│  📈 Sales Forecast                 [7 Days ▼]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Revenue Prediction                             │
│  ┌───────────────────────────────────────────┐ │
│  │     ╭──╮                                  │ │
│  │    ╱    ╲    ╭──────╮                     │ │
│  │   ╱      ╲  ╱        ╲                    │ │
│  │  ╱        ╲╱          ╲───────            │ │
│  │ ╱                                         │ │
│  │Mon  Tue  Wed  Thu  Fri  Sat  Sun         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  📦 Stock Preparation for Tomorrow:             │
│  ├─ Nasi Goreng: Siapkan 50 porsi (+10)        │
│  ├─ Es Teh: Siapkan 80 gelas (+15)             │
│  └─ Ayam: Siapkan 30 potong (normal)           │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 3. VoiceOrderButton Component

```typescript
// src/components/customer/VoiceOrderButton.tsx

interface VoiceOrderButtonProps {
  outletId: string;
  onOrderParsed: (items: ParsedOrderItem[]) => void;
}

// Features:
// - Push-to-talk or toggle mode
// - Visual feedback (waveform)
// - Transcript display
// - Confirmation modal
// - Error handling
```

**Design:**
```
┌──────────────────────────────────────┐
│                                      │
│           🎤                         │
│     [Tap to Order by Voice]          │
│                                      │
└──────────────────────────────────────┘

// When recording:
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐  │
│  │ 🔴 Listening...                │  │
│  │ ▁▂▃▅▆▇▅▃▂▁▂▃▅▆▇▅▃▂▁           │  │
│  │ "nasi goreng dua..."           │  │
│  └────────────────────────────────┘  │
│          [Stop Recording]            │
└──────────────────────────────────────┘

// Confirmation:
┌──────────────────────────────────────┐
│  ✅ Order Recognized:                │
│                                      │
│  • 2x Nasi Goreng Special  Rp 50.000 │
│  • 3x Es Teh Manis         Rp 15.000 │
│  ─────────────────────────────────── │
│  Total:                    Rp 65.000 │
│                                      │
│  [Cancel]              [Confirm ✓]   │
└──────────────────────────────────────┘
```

---

### 4. PricingRecommendationPanel Component

```typescript
// src/components/admin/ai/PricingRecommendationPanel.tsx

// Features:
// - List of recommendations
// - One-click apply
// - What-if simulator
// - History of changes
```

**Design:**
```
┌─────────────────────────────────────────────────┐
│  💰 AI Pricing Recommendations         [3 new]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────────────────────────────────┐│
│  │ Nasi Goreng Special                        ││
│  │ Current: Rp 25.000 → Suggested: Rp 28.000  ││
│  │ ↑ +12% | Confidence: 85%                   ││
│  │ "Menu best-seller dengan demand tinggi"    ││
│  │                                            ││
│  │ Impact: +Rp 450K/bulan revenue             ││
│  │                                            ││
│  │ [Reject]  [Simulate]  [Apply ✓]            ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  ┌────────────────────────────────────────────┐│
│  │ Es Jeruk                                   ││
│  │ Current: Rp 12.000 → Suggested: Rp 10.000  ││
│  │ ↓ -17% | Confidence: 72%                   ││
│  │ "Penjualan menurun, coba harga kompetitif" ││
│  └────────────────────────────────────────────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Order

### Phase 1: Foundation (Day 1)
```
1. Create database tables (migrations)
2. Setup Claude API service
3. Create /api/ai/insights endpoint
4. Build AIInsightsCard component
5. Integrate into dashboard
```

### Phase 2: Forecasting (Day 2)
```
1. Implement forecasting algorithm
2. Create /api/ai/forecast endpoint
3. Build SalesForecastChart component
4. Add stock recommendations
5. Integrate into dashboard
```

### Phase 3: Pricing (Day 3)
```
1. Create /api/ai/pricing endpoint
2. Build PricingRecommendationPanel
3. Add to menu management page
4. Implement apply/reject flow
```

### Phase 4: Voice (Day 4)
```
1. Setup Web Speech API
2. Create /api/ai/voice-parse endpoint
3. Build VoiceOrderButton component
4. Add to customer ordering page
5. Test & refine accuracy
```

### Phase 5: Polish (Day 5)
```
1. Error handling & edge cases
2. Loading states & animations
3. Mobile responsiveness
4. Performance optimization
5. End-to-end testing
```

---

## 🔐 Environment Variables Needed

```env
# AI Services
ANTHROPIC_API_KEY=sk-ant-...          # Claude API
OPENAI_API_KEY=sk-...                  # Fallback/alternative

# Feature Flags
ENABLE_AI_INSIGHTS=true
ENABLE_AI_FORECAST=true
ENABLE_AI_PRICING=true
ENABLE_VOICE_ORDER=true

# AI Configuration
AI_INSIGHTS_CACHE_TTL=3600            # 1 hour in seconds
AI_FORECAST_DAYS_DEFAULT=7
AI_MODEL=claude-3-sonnet-20240229
```

---

## 📊 Testing Strategy

### Unit Tests
- AI response parsing
- Forecast algorithm accuracy
- Voice transcript parsing
- Price calculation logic

### Integration Tests
- API endpoints with mock data
- Database operations
- Cache behavior

### E2E Tests
- Full insight generation flow
- Voice order complete flow
- Pricing apply flow

### Manual Testing
- Voice recognition with various accents
- Mobile device testing
- Slow network simulation

---

## 🚨 Error Handling

```typescript
// Standard AI API error response
interface AIErrorResponse {
  success: false;
  error: {
    code: 'RATE_LIMIT' | 'API_ERROR' | 'INVALID_INPUT' | 'NO_DATA';
    message: string;
    fallback?: any;  // basic stats if AI fails
  }
}

// Graceful degradation strategy:
// 1. If Claude API fails → use basic statistical analysis
// 2. If no data available → show helpful empty state
// 3. If rate limited → use cached data with warning
```

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Insight generation time | < 3s | API response time |
| Forecast accuracy | > 70% | Compare predicted vs actual |
| Voice recognition accuracy | > 80% | Successful parses / total attempts |
| User engagement | > 50% | Users who interact with AI features |

---

*Technical Roadmap v1.0 - Ready for Implementation*

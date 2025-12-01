# 🍽️ Savora - Digital Food Ordering System

A complete food ordering application for Indonesian SMEs (UMKM) with QR code-based ordering, real-time updates, and integrated payment processing.

## 🚀 Features

### Admin Side
- **Dashboard** - Real-time statistics and order overview
- **Menu Management** - Full CRUD for menu items with images
- **Category Management** - Organize menu items by categories
- **Table Management** - Generate QR codes for tables
- **Order Management** - View and update order status in real-time
- **Analytics** - Sales reports and popular items tracking

### Customer Side
- **QR Code Ordering** - Scan table QR code to start ordering
- **Menu Browsing** - Browse menu by categories
- **Shopping Cart** - Add items, customize orders
- **Payment** - Multiple payment methods via Midtrans
- **Order Tracking** - Real-time order status updates

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Real-time**: Supabase Realtime
- **Payment**: Midtrans
- **QR Codes**: qrcode library

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Midtrans account (for payments)

### Quick Start

1. **Clone and install dependencies**
   ```bash
   cd savora
   npm install
   ```

2. **Setup environment variables**

   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   NEXT_PUBLIC_APP_URL=http://localhost:3000

   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   MIDTRANS_IS_PRODUCTION=false
   ```

3. **Setup Supabase**

   - Create a new Supabase project
   - Go to SQL Editor
   - Run the migration script from `supabase/migrations/001_initial_schema.sql`
   - Create storage buckets: `store-logos`, `store-banners`, `menu-images`, `category-images`, `qr-codes`

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **SETUP.md** - Detailed setup instructions and current progress
- **guide.md** - Complete development guide with all specifications

## 🏗️ Project Structure

```
savora/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (customer)/        # Customer-facing pages
│   │   ├── admin/             # Admin dashboard pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── admin/            # Admin components
│   │   ├── customer/         # Customer components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utility libraries
│   │   ├── supabase/        # Supabase clients
│   │   ├── utils.ts         # Utility functions
│   │   └── validations.ts   # Zod schemas
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript types
│   └── middleware.ts        # Next.js middleware
├── supabase/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## 🎯 Current Progress

### ✅ Completed
- [x] Project setup and configuration
- [x] Database schema and types
- [x] Authentication system
- [x] Admin layout and navigation
- [x] Admin dashboard with statistics

### 🔄 In Progress
- [ ] Menu management pages
- [ ] Category management
- [ ] Table management with QR codes
- [ ] Order management
- [ ] Customer-facing interface
- [ ] Payment integration
- [ ] Real-time features

## 🔐 Authentication Flow

1. **Registration**: Users register as restaurant owners, automatically creating a store
2. **Login**: Email/password authentication via Supabase Auth
3. **Role-based Access**:
   - Owners: Full admin access
   - Staff: Limited admin access
   - Customers: Order-only access

## 💳 Payment Integration

Savora integrates with Midtrans for payment processing, supporting:
- QRIS
- E-wallets (GoPay, OVO, DANA, ShopeePay)
- Virtual Accounts (BCA, BNI, Mandiri)
- Cash payments

## 📱 Customer Ordering Flow

1. Customer scans QR code at table
2. Browse menu by categories
3. Add items to cart
4. Checkout and enter details
5. Choose payment method
6. Complete payment
7. Track order status in real-time

## 🔒 Security Features

- Row Level Security (RLS) policies on all tables
- Secure authentication with Supabase Auth
- Protected API routes
- Environment variable management
- Input validation with Zod

## 🚦 Getting Started for Development

1. Read `SETUP.md` for detailed setup instructions
2. Follow `guide.md` for implementation sequence
3. Complete Phase 4-6 for full functionality
4. Test thoroughly before deployment

## 📝 License

This project is created for Indonesian SMEs (UMKM).

## 🤝 Contributing

This is a complete application guide. Follow the implementation sequence in `guide.md` to build the full system.

## 📧 Support

For issues or questions, refer to the complete development guide in `guide.md`.

---

Built with ❤️ for Indonesian SMEs (UMKM)

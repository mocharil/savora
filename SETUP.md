# Savora - Setup Instructions

## Current Progress

### ✅ Completed
- **Phase 1**: Project setup with Next.js 14+, TypeScript, Tailwind CSS
- **Phase 1**: All dependencies installed (Supabase, Zustand, shadcn/ui, etc.)
- **Phase 1**: Supabase clients configured (browser, server, admin)
- **Phase 1**: Utility functions created (formatCurrency, generateSlug, etc.)
- **Phase 2**: TypeScript database types created
- **Phase 2**: SQL schema file created (`supabase/migrations/001_initial_schema.sql`)
- **Phase 3**: Authentication middleware setup
- **Phase 3**: Auth hook created
- **Phase 3**: Login and Register pages built
- **Phase 4**: Admin layout with sidebar and header
- **Phase 4**: Admin dashboard page with stats

### 🔄 Next Steps Required

## Step 1: Setup Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings > API**
3. Copy the following values:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

4. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 2: Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the script
7. Verify that all tables, functions, and policies are created successfully

## Step 3: Setup Storage Buckets

1. In Supabase Dashboard, go to **Storage**
2. Create the following buckets (all public):
   - `store-logos`
   - `store-banners`
   - `menu-images`
   - `category-images`
   - `qr-codes`

3. For each bucket, set up public access:
   - Click on the bucket
   - Go to **Policies**
   - Add a new policy: "Public Access"
   - Allow SELECT for all users: `(bucket_id = 'bucket-name')`
   - Allow INSERT/UPDATE for authenticated users: `(bucket_id = 'bucket-name' AND auth.role() = 'authenticated')`

## Step 4: Setup Midtrans Payment Gateway (Optional)

1. Go to [https://midtrans.com](https://midtrans.com) and create an account
2. Get your credentials from the dashboard
3. Update `.env.local`:
```env
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false
```

## Step 5: Run the Development Server

```bash
cd savora
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test the Application

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Create a new account (this will create an owner account and a store)
3. You'll be redirected to the admin dashboard
4. Start adding categories, menu items, and tables!

## What's Been Built

### File Structure
```
savora/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          ✅ Login page
│   │   │   └── register/page.tsx       ✅ Register page
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx      ✅ Dashboard with stats
│   │   │   ├── menu/                   🔄 To be built
│   │   │   ├── categories/             🔄 To be built
│   │   │   ├── tables/                 🔄 To be built
│   │   │   ├── orders/                 🔄 To be built
│   │   │   └── layout.tsx              ✅ Admin layout
│   │   └── middleware.ts               ✅ Auth middleware
│   ├── components/
│   │   ├── ui/                         ✅ shadcn components
│   │   └── admin/
│   │       ├── sidebar.tsx             ✅ Admin sidebar
│   │       └── header.tsx              ✅ Admin header
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               ✅ Browser client
│   │   │   ├── server.ts               ✅ Server client
│   │   │   └── admin.ts                ✅ Admin client
│   │   └── utils.ts                    ✅ Utility functions
│   ├── hooks/
│   │   └── use-auth.ts                 ✅ Auth hook
│   └── types/
│       └── database.ts                 ✅ Database types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      ✅ Complete schema
├── .env.local                          🔄 Needs Supabase/Midtrans keys
└── package.json                        ✅ All dependencies
```

## Remaining Work

### Admin Pages (Phase 4)
- Menu management (CRUD operations)
- Category management (CRUD operations)
- Table management with QR code generation
- Order management (view, update status)
- Analytics page

### Customer Side (Phase 5)
- QR code scanning entry point
- Menu browsing page
- Shopping cart functionality
- Checkout process
- Payment integration with Midtrans
- Order tracking

### Real-time Features (Phase 6)
- Real-time order updates using Supabase Realtime
- Notifications for new orders
- Live order status updates

## Troubleshooting

### Common Issues

1. **Build errors**: Make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. **Supabase connection errors**: Double-check your `.env.local` credentials

3. **Authentication errors**: Ensure the database migration ran successfully

4. **Type errors**: Run `npm run build` to check for TypeScript errors

## Development Tips

1. Use the guide.md file as reference for implementing remaining features
2. Follow the exact implementation sequence in the guide
3. Test each feature thoroughly before moving to the next
4. Keep the database types in sync with your Supabase schema

## Need Help?

Refer to the complete guide at `guide.md` for detailed implementation instructions for all remaining features.

<p align="center">
  <img src="public/savora_logo.png" alt="Savora Logo" width="120" />
</p>

<h1 align="center">Savora</h1>

<p align="center">
  <strong>Platform Manajemen Restoran Berbasis AI Pertama di Indonesia untuk UMKM F&B</strong>
</p>

<p align="center">
  <a href="#masalah-yang-diselesaikan">Masalah</a> •
  <a href="#solusi-savora">Solusi</a> •
  <a href="#fitur-utama">Fitur</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#instalasi">Instalasi</a> •
  <a href="#demo">Demo</a>
</p>

---

## Masalah yang Diselesaikan

UMKM F&B di Indonesia menghadapi berbagai tantangan operasional yang menghambat pertumbuhan bisnis:

| Masalah | Dampak |
|---------|--------|
| **Pencatatan Manual** | Order tertukar, salah input, data tidak akurat |
| **Antrian Panjang** | Pelanggan menunggu lama, experience buruk |
| **Tidak Ada Data Insight** | Keputusan bisnis berdasarkan feeling, bukan data |
| **Forecasting Sulit** | Stok berlebih atau kehabisan, food waste tinggi |
| **Pricing Tidak Optimal** | Margin tipis karena harga tidak sesuai demand |
| **Biaya Software Mahal** | Solusi enterprise terlalu mahal untuk UMKM |

Menurut data BPS, lebih dari 60% UMKM F&B masih menggunakan pencatatan manual dan kesulitan mengadopsi teknologi karena keterbatasan biaya dan kompleksitas sistem.

---

## Solusi Savora

Savora adalah platform manajemen restoran all-in-one yang dirancang khusus untuk UMKM F&B di Indonesia. Dengan fitur AI terintegrasi menggunakan **Google Gemini**, Savora membantu pemilik bisnis kuliner untuk mengelola operasional, meningkatkan penjualan, dan memberikan pengalaman terbaik kepada pelanggan.

### Mengapa Savora?

- **AI-Powered**: Fitur AI canggih untuk voice ordering, business insights, forecasting, dan smart pricing
- **Multi-tenant**: Satu platform untuk banyak toko dengan manajemen terpisah
- **QR Ordering**: Pelanggan pesan langsung dari meja via scan QR code
- **Real-time**: Update pesanan dan notifikasi secara real-time
- **Mobile-first**: Desain responsif untuk penggunaan di berbagai device
- **Affordable**: Pricing yang accessible untuk UMKM, ada tier gratis

### Arsitektur Multi-Tenant

Savora menggunakan arsitektur multi-tenant yang memungkinkan:
- Satu instalasi untuk banyak toko/restoran
- Setiap toko memiliki data terpisah dan aman
- Pengelolaan outlet/cabang dalam satu dashboard
- Custom branding (logo, warna tema) per toko

---

## Fitur Utama

### AI Features (Gemini-Powered)

| Fitur | Deskripsi | Manfaat |
|-------|-----------|---------|
| **Voice Ordering** | Pelanggan bisa memesan dengan berbicara dalam Bahasa Indonesia | Pemesanan lebih cepat, accessible untuk semua usia |
| **AI Food Assistant** | Chatbot rekomendasi menu personal berdasarkan preferensi pelanggan | Upselling otomatis, customer experience |
| **AI Menu Creator** | Generate resep dan kalkulasi HPP otomatis dari bahan yang tersedia | Efisiensi R&D menu, optimasi food cost |
| **Business Insights** | Analisis bisnis otomatis dengan tips actionable | Keputusan berbasis data, identifikasi peluang |
| **Sales Forecasting** | Prediksi penjualan 14 hari ke depan untuk perencanaan stok | Perencanaan stok akurat, kurangi food waste |
| **Smart Pricing** | Rekomendasi harga optimal berdasarkan data penjualan | Margin lebih baik, pricing kompetitif |

### Customer Side

| Fitur | Deskripsi |
|-------|-----------|
| **QR Code Ordering** | Scan QR di meja untuk mulai pesan |
| **Menu Browsing** | Jelajahi menu dengan filter kategori |
| **AI Recommendations** | Rekomendasi menu personal dari AI |
| **Shopping Cart** | Keranjang belanja dengan update real-time |
| **Order Tracking** | Lacak status pesanan secara real-time |
| **Multiple Payment** | QRIS, e-wallet, transfer bank, tunai |
| **Order History** | Riwayat pesanan untuk repeat order |

### Admin Dashboard

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard Analytics** | Statistik penjualan, grafik, dan overview |
| **Menu Management** | Kelola menu dengan gambar dan kategori |
| **Category Management** | Organisasi menu berdasarkan kategori |
| **Table & QR Management** | Generate dan kelola QR code untuk setiap meja |
| **Order Management** | Kelola pesanan dengan update status real-time |
| **POS System** | Point of Sale untuk kasir dengan UI modern |
| **User Management** | Kelola staff dengan role-based access |
| **Outlet Management** | Multi-outlet dalam satu toko |
| **Reports** | Laporan penjualan dan analitik |
| **Settings** | Pengaturan toko, tema, dan konfigurasi |

### UI/UX Features

- **Modern Design**: UI clean dan modern dengan Tailwind CSS
- **Custom Theming**: Setiap toko bisa kustomisasi warna tema
- **Loading States**: Animasi loading yang menarik (BlockLoader)
- **Responsive**: Optimal di desktop dan mobile
- **Dark/Light Mode**: Support tema gelap dan terang
- **FTUE Onboarding**: Panduan setup untuk user baru

---

## Tech Stack

| Kategori | Teknologi | Alasan |
|----------|-----------|--------|
| **Framework** | Next.js 15 (App Router) | Server components, API routes, optimized performance |
| **Language** | TypeScript | Type safety, better DX, catch errors early |
| **Database** | Supabase (PostgreSQL) | Managed database, realtime, auth built-in |
| **AI/ML** | Google Gemini (Vertex AI) | State-of-the-art LLM, vision capabilities, Indonesian language support |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, consistent design system |
| **State Management** | Zustand | Simple, performant state management |
| **Animation** | Framer Motion | Smooth animations |
| **Authentication** | JWT + bcrypt | Stateless auth, secure password hashing |
| **Real-time** | Supabase Realtime | Live updates |
| **Payment** | Midtrans | Indonesian payment gateway, full coverage |

---

## Instalasi

### Prerequisites

- **Node.js** 18.0 atau lebih baru
- **npm** atau **yarn** atau **pnpm**
- **Supabase** account (gratis)
- **Google Cloud** account untuk Gemini AI (opsional)

### Step 1: Clone Repository

```bash
git clone https://github.com/mocharil/savora.git
cd savora
```

### Step 2: Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### Step 3: Setup Environment Variables

Buat file `.env` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Gemini AI (untuk fitur AI)
GEMINI_PROJECT_ID=your_gcp_project_id
GEMINI_LOCATION=us-central1
GEMINI_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"..."}

# Midtrans Payment (Optional)
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false
```

### Step 4: Setup Database

1. Buat project baru di [Supabase](https://supabase.com)
2. Buka **SQL Editor** di Supabase Dashboard
3. Jalankan migration script dari folder `supabase/migrations/` secara berurutan
4. **Disable RLS** untuk development (atau setup policies sesuai kebutuhan)

```sql
-- Disable RLS untuk semua tabel (development only)
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
```

5. Buat Storage Buckets:
   - `store-logos`
   - `store-banners`
   - `menu-images`
   - `category-images`
   - `qr-codes`

### Step 5: Setup Gemini AI (Opsional)

Untuk mengaktifkan fitur AI:

1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Vertex AI API**
3. Buat Service Account dengan role "Vertex AI User"
4. Download JSON key
5. Convert ke single-line JSON dan masukkan ke `GEMINI_CREDENTIALS` env var

---

## Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## Struktur Project

```
savora/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Login, Register pages
│   │   ├── [storeSlug]/         # Customer-facing pages (dynamic)
│   │   ├── admin/               # Admin dashboard pages
│   │   └── api/                 # API routes
│   │       ├── admin/           # Admin APIs
│   │       ├── ai/              # AI-related APIs
│   │       ├── auth/            # Authentication APIs
│   │       └── customer/        # Customer APIs
│   ├── components/
│   │   ├── admin/               # Admin components
│   │   ├── customer/            # Customer components
│   │   └── ui/                  # shadcn/ui + custom components
│   ├── lib/
│   │   ├── ai/                  # AI services (forecast, insights, pricing)
│   │   ├── supabase/            # Supabase clients
│   │   ├── gemini.ts            # Gemini AI client
│   │   └── utils.ts             # Utility functions
│   ├── stores/                  # Zustand stores
│   ├── types/                   # TypeScript types
│   └── middleware.ts            # Auth middleware
├── public/                      # Static assets
├── supabase/
│   └── migrations/              # Database migrations
└── sql/                         # Additional SQL scripts
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Register user baru + buat store |
| POST | `/api/auth/login` | Login dan dapatkan JWT token |
| POST | `/api/auth/logout` | Logout dan hapus session |
| GET | `/api/auth/me` | Get current user info |

### AI Features
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/ai/voice-order` | Parse voice input ke order items |
| POST | `/api/ai/forecast` | Generate sales forecast |
| POST | `/api/ai/insights` | Get AI business insights |
| POST | `/api/ai/pricing` | Get smart pricing recommendations |
| POST | `/api/ai/menu-creator` | Generate recipe from ingredients |
| POST | `/api/ai/generate-dish-image` | Generate menu image with AI |
| POST | `/api/customer/ai-recommend` | Get menu recommendations |

### Admin APIs
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET/POST | `/api/admin/menu` | Menu CRUD |
| GET/POST | `/api/admin/categories` | Category CRUD |
| GET/POST | `/api/admin/tables` | Table management |
| GET/PATCH | `/api/admin/orders` | Order management |
| POST | `/api/admin/pos/orders` | Create POS order |

---

## Demo

### Login Credentials (Development)

```
Email: admin@savora.id
Password: Password123
```

### Customer Flow

1. Buka `http://localhost:3000/{store-slug}/order`
2. Browse menu dan tambah ke keranjang
3. Klik tombol AI untuk rekomendasi
4. Checkout dan pilih metode pembayaran

### Admin Flow

1. Login di `http://localhost:3000/login`
2. Akses dashboard di `/admin/dashboard`
3. Kelola menu, kategori, meja, dan pesanan
4. Gunakan POS untuk transaksi kasir

---

## Screenshots

<details>
<summary>Lihat Screenshots</summary>

### Landing Page
Modern landing page dengan fitur highlight dan pricing

### Admin Dashboard
Dashboard dengan statistik real-time dan grafik penjualan

### POS System
Point of Sale dengan menu grouped by category

### AI Chatbot
Chatbot rekomendasi menu dengan visual menu cards

### Customer Order
Halaman pemesanan customer dengan tema kustomisasi

</details>

---

## Roadmap

### Completed
- [x] Core Features (Menu, Order, Payment)
- [x] AI Voice Ordering
- [x] AI Recommendations
- [x] AI Menu Creator
- [x] Business Insights & Forecasting
- [x] POS System
- [x] Multi-tenant Architecture
- [x] FTUE Onboarding

### Planned
- [ ] Kitchen Display System (KDS)
- [ ] Inventory Management
- [ ] Loyalty Program
- [ ] Multi-language Support
- [ ] Mobile App (React Native)

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add some amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: [SETUP.md](SETUP.md)
- **Issues**: [GitHub Issues](https://github.com/mocharil/savora/issues)

---

<p align="center">
  <strong>Built for Indonesian UMKM F&B</strong>
</p>

<p align="center">
  <a href="https://savora.id">Website</a> •
  <a href="https://github.com/mocharil/savora">GitHub</a>
</p>

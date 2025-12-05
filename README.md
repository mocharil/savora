<p align="center">
  <img src="public/savora_logo.png" alt="Savora Logo" width="120" />
</p>

<h1 align="center">Savora</h1>

<p align="center">
  <strong>Platform Manajemen Restoran Berbasis AI untuk UMKM F&B Indonesia</strong>
</p>

<p align="center">
  <a href="#masalah-yang-diselesaikan">Masalah</a> •
  <a href="#solusi-savora">Solusi</a> •
  <a href="#fitur">Fitur</a> •
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

Savora adalah platform manajemen restoran all-in-one yang dirancang khusus untuk UMKM F&B. Dengan integrasi AI menggunakan Google Gemini, Savora mengubah cara bisnis kuliner beroperasi:

### Nilai Utama

1. **Digitalisasi Operasional** - Semua proses dari order hingga pembayaran digital dan tercatat
2. **AI-Powered Insights** - Keputusan bisnis berbasis data, bukan intuisi
3. **Customer Experience** - Pemesanan cepat via QR, tidak perlu antri
4. **Affordable** - Pricing yang accessible untuk UMKM, ada tier gratis

### Arsitektur Multi-Tenant

Savora menggunakan arsitektur multi-tenant yang memungkinkan:
- Satu instalasi untuk banyak toko/restoran
- Setiap toko memiliki data terpisah dan aman
- Pengelolaan outlet/cabang dalam satu dashboard
- Custom branding (logo, warna tema) per toko

---

## Fitur

### AI Features (Google Gemini)

| Fitur | Deskripsi | Manfaat |
|-------|-----------|---------|
| **Voice Ordering** | Pelanggan memesan dengan berbicara dalam Bahasa Indonesia | Pemesanan lebih cepat, accessible untuk semua usia |
| **AI Menu Creator** | Generate resep dan kalkulasi HPP otomatis dari bahan yang tersedia | Efisiensi R&D menu, optimasi food cost |
| **Business Insights** | Analisis penjualan harian dengan rekomendasi actionable | Keputusan berbasis data, identifikasi peluang |
| **Sales Forecasting** | Prediksi penjualan 14 hari ke depan per menu item | Perencanaan stok akurat, kurangi food waste |
| **Smart Pricing** | Rekomendasi harga optimal berdasarkan demand pattern | Margin lebih baik, pricing kompetitif |
| **AI Food Assistant** | Chatbot rekomendasi menu personal untuk pelanggan | Upselling otomatis, customer experience |

### Customer Features

| Fitur | Deskripsi |
|-------|-----------|
| **QR Code Ordering** | Scan QR di meja, langsung browse menu dan pesan |
| **Menu Browsing** | Filter berdasarkan kategori, search menu |
| **Real-time Order Tracking** | Lacak status pesanan dari confirmed hingga ready |
| **Multiple Payment** | QRIS, e-wallet, transfer bank, tunai |
| **Order History** | Riwayat pesanan untuk repeat order |

### Admin Dashboard

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard Analytics** | Overview penjualan, grafik trend, perbandingan periode |
| **Menu Management** | CRUD menu dengan gambar, kategori, harga, ketersediaan |
| **Category Management** | Organisasi menu dalam kategori dengan icon/gambar |
| **Table Management** | Kelola meja, generate QR code per meja |
| **Order Management** | Terima, proses, selesaikan pesanan dengan status tracking |
| **POS System** | Point of Sale untuk transaksi kasir walk-in |
| **User Management** | Kelola staff dengan role-based access |
| **Outlet Management** | Multi-outlet dalam satu toko |
| **Store Settings** | Konfigurasi toko, tema, jam operasional |

### Onboarding System (FTUE)

Sistem panduan untuk user baru dengan checklist setup:
1. Buat outlet pertama
2. Buat kategori menu
3. Tambahkan menu item
4. Setup meja dan QR code
5. Undang staff (opsional)

---

## Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Framework** | Next.js 15 (App Router) | Server components, API routes, optimized performance |
| **Language** | TypeScript | Type safety, better DX, catch errors early |
| **Database** | Supabase (PostgreSQL) | Managed database, realtime, auth built-in |
| **AI/ML** | Google Gemini (Vertex AI) | State-of-the-art LLM, vision capabilities, Indonesian language support |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, consistent design system |
| **State** | Zustand | Simple, performant state management |
| **Auth** | JWT + bcrypt | Stateless auth, secure password hashing |
| **Payment** | Midtrans | Indonesian payment gateway, full coverage |
| **Hosting** | Vercel | Edge network, automatic scaling |

---

## Instalasi

### Prerequisites

- Node.js 18.0+
- npm/yarn/pnpm
- Supabase account (gratis)
- Google Cloud account (untuk AI features)

### 1. Clone Repository

```bash
git clone https://github.com/mocharil/savora.git
cd savora
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# Gemini AI (untuk fitur AI)
GEMINI_PROJECT_ID=your_gcp_project_id
GEMINI_LOCATION=us-central1
GEMINI_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"..."}

# Midtrans Payment (opsional)
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false
```

### 4. Setup Supabase Database

1. Buat project di [Supabase](https://supabase.com)
2. Buka SQL Editor
3. Jalankan migration scripts dari `supabase/migrations/` secara berurutan (001, 002, dst)
4. Buat Storage Buckets:
   - `store-logos`
   - `store-banners`
   - `menu-images`
   - `category-images`
   - `qr-codes`

### 5. Setup Google Cloud (untuk AI)

1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Enable Vertex AI API
3. Buat Service Account dengan role "Vertex AI User"
4. Download JSON key
5. Convert ke single-line JSON dan masukkan ke `GEMINI_CREDENTIALS` env var

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Struktur Project

```
savora/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, Register
│   │   ├── [storeSlug]/        # Customer pages (dynamic routing)
│   │   ├── admin/              # Admin dashboard
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── admin/              # Admin components
│   │   ├── customer/           # Customer components
│   │   └── ui/                 # Shared UI components
│   ├── lib/
│   │   ├── ai/                 # AI services
│   │   ├── supabase/           # Database clients
│   │   └── gemini.ts           # Gemini AI client
│   ├── stores/                 # Zustand state
│   └── types/                  # TypeScript types
├── public/                     # Static assets
└── supabase/migrations/        # Database migrations
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Register + create store |
| POST | `/api/auth/login` | Login, return JWT |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Get current user |

### AI Features
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/ai/voice-order` | Parse voice to order items |
| POST | `/api/ai/forecast` | Sales prediction 14 days |
| POST | `/api/ai/insights` | Business recommendations |
| POST | `/api/ai/pricing` | Price optimization |
| POST | `/api/ai/menu-creator` | Generate recipe from ingredients |
| POST | `/api/ai/generate-dish-image` | Generate menu image with AI |

### Admin
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET/POST | `/api/admin/menu` | Menu CRUD |
| GET/POST | `/api/admin/categories` | Category CRUD |
| GET/POST | `/api/admin/tables` | Table management |
| GET/PATCH | `/api/admin/orders` | Order management |
| POST | `/api/admin/pos/orders` | Create POS order |

---

## Demo

### Development Credentials

```
Email: admin@savora.id
Password: Password123
```

### Customer Flow

1. Buka `/{store-slug}/order`
2. Browse menu, tambah ke cart
3. Gunakan voice ordering atau AI assistant
4. Checkout, pilih payment method

### Admin Flow

1. Login di `/login`
2. Dashboard overview di `/admin/dashboard`
3. Kelola menu di `/admin/menu`
4. Proses order di `/admin/orders`
5. Gunakan POS di `/admin/pos`

---

## Roadmap

### Completed
- Core Features (Menu, Order, Payment)
- AI Voice Ordering
- AI Recommendations & Insights
- Sales Forecasting & Smart Pricing
- POS System
- Multi-tenant Architecture
- FTUE Onboarding

### Planned
- Kitchen Display System (KDS)
- Inventory Management
- Loyalty Program
- Multi-language Support
- Mobile App (React Native)

---

## Contributing

```bash
# Fork repo
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- Documentation: [SETUP.md](SETUP.md)
- Issues: [GitHub Issues](https://github.com/mocharil/savora/issues)

---

<p align="center">
  <strong>Built for Indonesian UMKM F&B</strong>
</p>

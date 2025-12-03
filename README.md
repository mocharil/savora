<p align="center">
  <img src="public/savora_logo.png" alt="Savora Logo" width="120" />
</p>

<h1 align="center">Savora</h1>

<p align="center">
  <strong>Platform Manajemen Restoran Berbasis AI Pertama di Indonesia untuk UMKM F&B</strong>
</p>

<p align="center">
  <a href="#fitur-utama">Fitur</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#instalasi">Instalasi</a> •
  <a href="#menjalankan-aplikasi">Menjalankan</a> •
  <a href="#demo">Demo</a>
</p>

---

## Tentang Savora

Savora adalah platform manajemen restoran all-in-one yang dirancang khusus untuk UMKM F&B di Indonesia. Dengan fitur AI terintegrasi menggunakan **Google Gemini**, Savora membantu pemilik bisnis kuliner untuk mengelola operasional, meningkatkan penjualan, dan memberikan pengalaman terbaik kepada pelanggan.

### Mengapa Savora?

- **AI-Powered**: Fitur AI canggih untuk voice ordering, business insights, forecasting, dan smart pricing
- **Multi-tenant**: Satu platform untuk banyak toko dengan manajemen terpisah
- **QR Ordering**: Pelanggan pesan langsung dari meja via scan QR code
- **Real-time**: Update pesanan dan notifikasi secara real-time
- **Mobile-first**: Desain responsif untuk penggunaan di berbagai device

---

## Fitur Utama

### 🤖 AI Features (Gemini-Powered)

| Fitur | Deskripsi |
|-------|-----------|
| **Voice Ordering** | Pelanggan bisa memesan dengan berbicara dalam Bahasa Indonesia |
| **AI Food Assistant** | Chatbot rekomendasi menu personal berdasarkan preferensi pelanggan |
| **Business Insights** | Analisis bisnis otomatis dengan tips actionable |
| **Sales Forecasting** | Prediksi penjualan 14 hari ke depan untuk perencanaan stok |
| **Smart Pricing** | Rekomendasi harga optimal berdasarkan data penjualan |

### 📱 Customer Side

| Fitur | Deskripsi |
|-------|-----------|
| **QR Code Ordering** | Scan QR di meja untuk mulai pesan |
| **Menu Browsing** | Jelajahi menu dengan filter kategori |
| **AI Recommendations** | Rekomendasi menu personal dari AI |
| **Shopping Cart** | Keranjang belanja dengan update real-time |
| **Order Tracking** | Lacak status pesanan secara real-time |
| **Multiple Payment** | QRIS, e-wallet, transfer bank, tunai |

### 🏪 Admin Dashboard

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard Analytics** | Statistik penjualan, grafik, dan overview |
| **Menu Management** | Kelola menu dengan gambar dan kategori |
| **Category Management** | Organisasi menu berdasarkan kategori |
| **Table & QR Management** | Generate dan kelola QR code untuk setiap meja |
| **Order Management** | Kelola pesanan dengan update status real-time |
| **POS System** | Point of Sale untuk kasir dengan UI modern |
| **Reports** | Laporan penjualan dan analitik |
| **Settings** | Pengaturan toko, tema, dan konfigurasi |

### 🎨 UI/UX Features

- **Modern Design**: UI clean dan modern dengan Tailwind CSS
- **Custom Theming**: Setiap toko bisa kustomisasi warna tema
- **Loading States**: Animasi loading yang menarik (BlockLoader)
- **Responsive**: Optimal di desktop dan mobile
- **Dark/Light Mode**: Support tema gelap dan terang

---

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **AI/ML** | Google Gemini AI |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State Management** | Zustand |
| **Animation** | Framer Motion |
| **Authentication** | JWT + bcrypt |
| **Real-time** | Supabase Realtime |
| **Payment** | Midtrans |

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

Buat file `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Gemini AI (Optional - untuk fitur AI)
GEMINI_CREDENTIALS={"type":"service_account",...}
# atau simpan di file gemini-credentials.json

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
3. Buat Service Account dan download JSON key
4. Simpan credentials di `gemini-credentials.json` atau sebagai env var `GEMINI_CREDENTIALS`

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

- [x] Core Features (Menu, Order, Payment)
- [x] AI Voice Ordering
- [x] AI Recommendations
- [x] Business Insights & Forecasting
- [x] POS System
- [x] Multi-tenant Architecture
- [ ] Mobile App (React Native)
- [ ] Kitchen Display System (KDS)
- [ ] Inventory Management
- [ ] Loyalty Program
- [ ] Multi-language Support

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
- **Email**: support@savora.id

---

<p align="center">
  <strong>Built with ❤️ for Indonesian UMKM F&B</strong>
</p>

<p align="center">
  <a href="https://savora.id">Website</a> •
  <a href="https://github.com/mocharil/savora">GitHub</a>
</p>

// Tour Configuration - All tour definitions
export type TourPosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface TourStep {
  target: string // CSS selector for the target element
  title: string
  description: string
  position?: TourPosition
  spotlightPadding?: number
}

export interface TourConfig {
  id: string
  name: string
  description: string
  steps: TourStep[]
  category: 'ftue' | 'page' | 'feature'
}

// Main FTUE Tour - First Time User Experience
export const TOUR_FTUE_MAIN: TourConfig = {
  id: 'ftue_main',
  name: 'Tour Pengenalan',
  description: 'Pengenalan fitur-fitur utama Savora Admin',
  category: 'ftue',
  steps: [
    {
      target: '[data-tour="sidebar-logo"]',
      title: 'Selamat Datang di Savora!',
      description: 'Ini adalah panel admin untuk mengelola restoran Anda. Mari kita lihat fitur-fitur utamanya.',
      position: 'right',
    },
    {
      target: '[data-tour="sidebar-dashboard"]',
      title: 'Dashboard Utama',
      description: 'Di sini Anda bisa melihat ringkasan performa outlet, statistik penjualan, dan insight bisnis.',
      position: 'right',
    },
    {
      target: '[data-tour="sidebar-orders"]',
      title: 'Kelola Pesanan',
      description: 'Menu ini untuk melihat dan memproses semua pesanan yang masuk dari pelanggan.',
      position: 'right',
    },
    {
      target: '[data-tour="sidebar-menu"]',
      title: 'Kelola Menu',
      description: 'Tambah, edit, dan atur menu makanan & minuman yang tersedia di outlet Anda.',
      position: 'right',
    },
    {
      target: '[data-tour="sidebar-tables"]',
      title: 'Meja & QR Code',
      description: 'Kelola meja dan generate QR code untuk pemesanan digital di setiap meja.',
      position: 'right',
    },
    {
      target: '[data-tour="header-notification"]',
      title: 'Notifikasi Pesanan',
      description: 'Icon lonceng akan memberi tahu Anda jika ada pesanan baru yang perlu diproses.',
      position: 'bottom',
    },
    {
      target: '[data-tour="sidebar-profile"]',
      title: 'Profil & Pengaturan',
      description: 'Akses profil, pengaturan akun, dan logout dari sini. Selamat menggunakan Savora!',
      position: 'top',
    },
  ],
}

// Users Page Tour
export const TOUR_USERS_PAGE: TourConfig = {
  id: 'tour_users_page',
  name: 'Tutorial Halaman Users',
  description: 'Pelajari cara mengelola user dan staff',
  category: 'page',
  steps: [
    {
      target: '[data-tour="users-add-btn"]',
      title: 'Tambah User Baru',
      description: 'Klik tombol ini untuk menambahkan staff atau admin baru ke sistem.',
      position: 'left',
    },
    {
      target: '[data-tour="users-filter-role"]',
      title: 'Filter Berdasarkan Role',
      description: 'Gunakan filter ini untuk melihat user berdasarkan peran: Owner, Outlet Admin, atau Staff.',
      position: 'bottom',
    },
    {
      target: '[data-tour="users-search"]',
      title: 'Cari User',
      description: 'Ketik nama atau email untuk mencari user dengan cepat.',
      position: 'bottom',
    },
    {
      target: '[data-tour="users-table"]',
      title: 'Daftar User',
      description: 'Semua user dan informasi akses outlet ditampilkan di tabel ini. Klik baris untuk melihat detail.',
      position: 'top',
    },
  ],
}

// Orders Page Tour
export const TOUR_ORDERS_PAGE: TourConfig = {
  id: 'tour_orders_page',
  name: 'Tutorial Halaman Pesanan',
  description: 'Pelajari cara mengelola pesanan',
  category: 'page',
  steps: [
    {
      target: '[data-tour="orders-tabs"]',
      title: 'Status Pesanan',
      description: 'Filter pesanan berdasarkan status: Semua, Baru, Dikonfirmasi, Diproses, Siap, atau Selesai.',
      position: 'bottom',
    },
    {
      target: '[data-tour="orders-search"]',
      title: 'Cari Pesanan',
      description: 'Cari pesanan berdasarkan nomor pesanan atau nama pelanggan.',
      position: 'bottom',
    },
    {
      target: '[data-tour="orders-date-filter"]',
      title: 'Filter Tanggal',
      description: 'Gunakan tombol "Hari Ini" atau pilih rentang tanggal untuk melihat pesanan periode tertentu.',
      position: 'bottom',
    },
    {
      target: '[data-tour="orders-list"]',
      title: 'Daftar Pesanan',
      description: 'Pesanan ditampilkan di sini. Klik untuk melihat detail dan memproses pesanan.',
      position: 'top',
    },
  ],
}

// Menu Page Tour
export const TOUR_MENU_PAGE: TourConfig = {
  id: 'tour_menu_page',
  name: 'Tutorial Halaman Menu',
  description: 'Pelajari cara mengelola menu makanan',
  category: 'page',
  steps: [
    {
      target: '[data-tour="menu-add-btn"]',
      title: 'Tambah Menu Baru',
      description: 'Klik tombol ini untuk menambahkan item menu baru ke restoran Anda.',
      position: 'left',
    },
    {
      target: '[data-tour="menu-category-filter"]',
      title: 'Filter Kategori',
      description: 'Filter menu berdasarkan kategori untuk mempermudah pencarian.',
      position: 'bottom',
    },
    {
      target: '[data-tour="menu-search"]',
      title: 'Cari Menu',
      description: 'Ketik nama menu untuk mencari dengan cepat.',
      position: 'bottom',
    },
    {
      target: '[data-tour="menu-grid"]',
      title: 'Daftar Menu',
      description: 'Semua menu ditampilkan di sini. Klik item untuk edit atau ubah status ketersediaan.',
      position: 'top',
    },
  ],
}

// Tables Page Tour
export const TOUR_TABLES_PAGE: TourConfig = {
  id: 'tour_tables_page',
  name: 'Tutorial Halaman Meja & QR',
  description: 'Pelajari cara mengelola meja dan QR code',
  category: 'page',
  steps: [
    {
      target: '[data-tour="tables-add-btn"]',
      title: 'Tambah Meja',
      description: 'Klik untuk menambahkan meja baru dan otomatis generate QR code.',
      position: 'left',
    },
    {
      target: '[data-tour="tables-list"]',
      title: 'Daftar Meja',
      description: 'Semua meja ditampilkan di sini. Setiap meja memiliki QR code unik untuk pemesanan.',
      position: 'top',
    },
    {
      target: '[data-tour="tables-qr-download"]',
      title: 'Download QR Code',
      description: 'Klik tombol download untuk mengunduh QR code dan cetak untuk ditempel di meja.',
      position: 'left',
    },
  ],
}

// Dashboard Page Tour
export const TOUR_DASHBOARD_PAGE: TourConfig = {
  id: 'tour_dashboard_page',
  name: 'Tutorial Halaman Dashboard',
  description: 'Pelajari cara membaca dashboard',
  category: 'page',
  steps: [
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Statistik Utama',
      description: 'Lihat ringkasan penjualan, jumlah pesanan, dan metrik penting lainnya.',
      position: 'bottom',
    },
    {
      target: '[data-tour="dashboard-recent-orders"]',
      title: 'Pesanan Terbaru',
      description: 'Lihat pesanan terbaru yang masuk dan statusnya.',
      position: 'top',
    },
  ],
}

// Categories Page Tour
export const TOUR_CATEGORIES_PAGE: TourConfig = {
  id: 'tour_categories_page',
  name: 'Tutorial Halaman Kategori',
  description: 'Pelajari cara mengelola kategori menu',
  category: 'page',
  steps: [
    {
      target: '[data-tour="categories-add-btn"]',
      title: 'Tambah Kategori',
      description: 'Klik tombol ini untuk membuat kategori baru seperti Makanan, Minuman, Dessert, dll.',
      position: 'left',
    },
    {
      target: '[data-tour="categories-list"]',
      title: 'Daftar Kategori',
      description: 'Semua kategori ditampilkan di sini. Anda bisa drag & drop untuk mengubah urutan.',
      position: 'top',
    },
  ],
}

// Outlets Page Tour
export const TOUR_OUTLETS_PAGE: TourConfig = {
  id: 'tour_outlets_page',
  name: 'Tutorial Halaman Outlet',
  description: 'Pelajari cara mengelola outlet',
  category: 'page',
  steps: [
    {
      target: '[data-tour="outlets-add-btn"]',
      title: 'Tambah Outlet',
      description: 'Klik untuk menambahkan outlet/cabang baru ke bisnis Anda.',
      position: 'left',
    },
    {
      target: '[data-tour="outlets-list"]',
      title: 'Daftar Outlet',
      description: 'Semua outlet ditampilkan di sini. Klik outlet untuk melihat detail dan pengaturan.',
      position: 'top',
    },
  ],
}

// Analytics Page Tour
export const TOUR_ANALYTICS_PAGE: TourConfig = {
  id: 'tour_analytics_page',
  name: 'Tutorial Halaman Analytics',
  description: 'Pelajari cara membaca analitik bisnis',
  category: 'page',
  steps: [
    {
      target: '[data-tour="analytics-date-range"]',
      title: 'Pilih Rentang Waktu',
      description: 'Pilih periode waktu untuk melihat data analitik: harian, mingguan, atau bulanan.',
      position: 'bottom',
    },
    {
      target: '[data-tour="analytics-charts"]',
      title: 'Grafik & Statistik',
      description: 'Lihat visualisasi data penjualan, tren, dan performa bisnis Anda.',
      position: 'top',
    },
    {
      target: '[data-tour="analytics-top-items"]',
      title: 'Menu Terlaris',
      description: 'Lihat menu-menu yang paling banyak dipesan oleh pelanggan.',
      position: 'top',
    },
  ],
}

// Settings Page Tour
export const TOUR_SETTINGS_PAGE: TourConfig = {
  id: 'tour_settings_page',
  name: 'Tutorial Halaman Pengaturan',
  description: 'Pelajari cara mengatur toko',
  category: 'page',
  steps: [
    {
      target: '[data-tour="settings-store-info"]',
      title: 'Informasi Toko',
      description: 'Atur nama toko, logo, dan informasi dasar lainnya.',
      position: 'bottom',
    },
    {
      target: '[data-tour="settings-operation"]',
      title: 'Jam Operasional',
      description: 'Atur jam buka dan tutup untuk setiap hari.',
      position: 'top',
    },
    {
      target: '[data-tour="settings-payment"]',
      title: 'Metode Pembayaran',
      description: 'Kelola metode pembayaran yang diterima di toko Anda.',
      position: 'top',
    },
  ],
}

// AI Assistant Page Tour
export const TOUR_AI_PAGE: TourConfig = {
  id: 'tour_ai_page',
  name: 'Tutorial AI Assistant',
  description: 'Pelajari cara menggunakan AI Assistant',
  category: 'page',
  steps: [
    {
      target: '[data-tour="ai-menu-creator"]',
      title: 'AI Menu Creator',
      description: 'Buat menu baru dengan bantuan AI. Cukup deskripsikan menu yang ingin dibuat.',
      position: 'bottom',
    },
    {
      target: '[data-tour="ai-pricing"]',
      title: 'AI Pricing Optimizer',
      description: 'Dapatkan rekomendasi harga optimal berdasarkan analisis pasar.',
      position: 'bottom',
    },
    {
      target: '[data-tour="ai-analytics"]',
      title: 'AI Business Insights',
      description: 'Dapatkan insight dan rekomendasi bisnis dari AI.',
      position: 'bottom',
    },
  ],
}

// POS Kasir Page Tour
export const TOUR_POS_PAGE: TourConfig = {
  id: 'tour_pos_page',
  name: 'Tutorial POS Kasir',
  description: 'Pelajari cara menggunakan sistem kasir',
  category: 'page',
  steps: [
    {
      target: '[data-tour="pos-header"]',
      title: 'Selamat Datang di POS Kasir!',
      description: 'Ini adalah sistem Point of Sale untuk memproses pesanan langsung dari kasir.',
      position: 'bottom',
    },
    {
      target: '[data-tour="pos-search"]',
      title: 'Cari Menu',
      description: 'Ketik nama menu untuk mencari dengan cepat. Anda juga bisa filter berdasarkan kategori.',
      position: 'bottom',
    },
    {
      target: '[data-tour="pos-categories"]',
      title: 'Filter Kategori',
      description: 'Klik kategori untuk menampilkan menu sesuai kategori. Klik "Semua" untuk melihat semua menu.',
      position: 'bottom',
    },
    {
      target: '[data-tour="pos-menu-grid"]',
      title: 'Daftar Menu',
      description: 'Klik item menu untuk menambahkan ke keranjang. Badge angka menunjukkan jumlah yang sudah dipilih.',
      position: 'left',
    },
    {
      target: '[data-tour="pos-cart"]',
      title: 'Keranjang Belanja',
      description: 'Semua item yang dipilih akan muncul di sini. Anda bisa mengubah jumlah atau menghapus item.',
      position: 'left',
    },
    {
      target: '[data-tour="pos-customer-info"]',
      title: 'Info Pelanggan & Meja',
      description: 'Masukkan nama pelanggan (opsional) dan WAJIB pilih nomor meja sebelum membuat pesanan.',
      position: 'left',
    },
    {
      target: '[data-tour="pos-payment"]',
      title: 'Metode Pembayaran',
      description: 'Pilih metode pembayaran: Tunai, QRIS, atau Kartu. Untuk tunai, masukkan jumlah uang untuk menghitung kembalian.',
      position: 'left',
    },
    {
      target: '[data-tour="pos-checkout"]',
      title: 'Proses Pesanan',
      description: 'Setelah semua lengkap, klik tombol "Buat Pesanan" untuk memproses. Pesanan akan masuk ke daftar Pesanan.',
      position: 'top',
    },
  ],
}

// All tours registry
export const ALL_TOURS: TourConfig[] = [
  TOUR_FTUE_MAIN,
  TOUR_DASHBOARD_PAGE,
  TOUR_ORDERS_PAGE,
  TOUR_MENU_PAGE,
  TOUR_CATEGORIES_PAGE,
  TOUR_TABLES_PAGE,
  TOUR_OUTLETS_PAGE,
  TOUR_USERS_PAGE,
  TOUR_ANALYTICS_PAGE,
  TOUR_AI_PAGE,
  TOUR_SETTINGS_PAGE,
  TOUR_POS_PAGE,
]

// Get tour by ID
export function getTourById(tourId: string): TourConfig | undefined {
  return ALL_TOURS.find(tour => tour.id === tourId)
}

// Get tours by category
export function getToursByCategory(category: TourConfig['category']): TourConfig[] {
  return ALL_TOURS.filter(tour => tour.category === category)
}

// Get page tour ID from pathname
export function getPageTourId(pathname: string): string | null {
  if (pathname.includes('/admin/dashboard')) return 'tour_dashboard_page'
  if (pathname.includes('/admin/pos')) return 'tour_pos_page'
  if (pathname.includes('/admin/orders')) return 'tour_orders_page'
  if (pathname.includes('/admin/menu') && !pathname.includes('/create') && !pathname.includes('/edit')) return 'tour_menu_page'
  if (pathname.includes('/admin/categories') && !pathname.includes('/create') && !pathname.includes('/edit')) return 'tour_categories_page'
  if (pathname.includes('/admin/tables') && !pathname.includes('/create')) return 'tour_tables_page'
  if (pathname.includes('/admin/outlets') && !pathname.includes('/create') && !pathname.includes('/edit')) return 'tour_outlets_page'
  if (pathname.includes('/admin/users')) return 'tour_users_page'
  if (pathname.includes('/admin/analytics')) return 'tour_analytics_page'
  if (pathname.includes('/admin/ai')) return 'tour_ai_page'
  if (pathname.includes('/admin/settings')) return 'tour_settings_page'
  return null
}

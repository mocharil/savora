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
  name: 'Tutorial Halaman Manajemen User',
  description: 'Pelajari cara mengelola user dan staff restoran',
  category: 'page',
  steps: [
    {
      target: '[data-tour="users-add-btn"]',
      title: 'Tambah User Baru',
      description: 'Klik tombol ini untuk menambahkan staff baru. Pilih role sesuai tugas: Admin (akses penuh), Staff Dapur (kelola pesanan dapur), Pelayan (akses meja dan menu), atau Kasir (kelola pembayaran).',
      position: 'left',
    },
    {
      target: '[data-tour="users-search"]',
      title: 'Cari User',
      description: 'Ketik nama atau email untuk mencari user dengan cepat. Pencarian akan langsung memfilter tabel.',
      position: 'bottom',
    },
    {
      target: '[data-tour="users-filter-role"]',
      title: 'Filter Berdasarkan Role',
      description: 'Filter user berdasarkan peran: Semua, Admin, Staff Dapur, Pelayan, atau Kasir. Setiap role memiliki akses berbeda sesuai kebutuhan operasional restoran.',
      position: 'bottom',
    },
    {
      target: '[data-tour="users-table"]',
      title: 'Daftar User',
      description: 'Tabel ini menampilkan semua user beserta role dan status aktif/nonaktif. Klik Edit untuk mengubah informasi user, atau Hapus untuk menghapus user (kecuali akun Anda sendiri).',
      position: 'top',
    },
  ],
}

// Orders Page Tour
export const TOUR_ORDERS_PAGE: TourConfig = {
  id: 'tour_orders_page',
  name: 'Tutorial Halaman Pesanan',
  description: 'Pelajari cara mengelola dan memproses pesanan dari pelanggan',
  category: 'page',
  steps: [
    {
      target: '[data-tour="orders-tabs"]',
      title: 'Filter Status Pesanan',
      description: 'Filter pesanan berdasarkan status: Semua, Baru (menunggu konfirmasi), Dikonfirmasi, Diproses, Siap (untuk disajikan), atau Selesai. Tab dengan badge merah menandakan pesanan baru yang perlu ditangani.',
      position: 'bottom',
    },
    {
      target: '[data-tour="orders-filters"]',
      title: 'Pencarian & Filter',
      description: 'Gunakan kotak pencarian untuk mencari berdasarkan nomor pesanan, nama pelanggan, atau nomor meja. Filter berdasarkan tanggal (Hari Ini, 7 Hari) dan urutkan berdasarkan Waktu atau Total.',
      position: 'bottom',
    },
    {
      target: '[data-tour="orders-date-filter"]',
      title: 'Filter Tanggal',
      description: 'Pilih "Hari Ini" untuk pesanan hari ini, "7 Hari" untuk minggu terakhir, atau "Semua" untuk melihat seluruh pesanan.',
      position: 'bottom',
    },
    {
      target: '[data-tour="orders-list"]',
      title: 'Daftar Pesanan',
      description: 'Tabel ini menampilkan semua pesanan dengan info lengkap: nomor pesanan, nomor meja, jumlah item, total harga, status, dan status pembayaran. Klik "Detail" untuk melihat detail pesanan dan mengubah statusnya.',
      position: 'top',
    },
  ],
}

// Menu Page Tour
export const TOUR_MENU_PAGE: TourConfig = {
  id: 'tour_menu_page',
  name: 'Tutorial Halaman Menu',
  description: 'Pelajari cara mengelola menu makanan dan minuman',
  category: 'page',
  steps: [
    {
      target: '[data-tour="menu-add-btn"]',
      title: 'Tambah Menu Baru',
      description: 'Klik tombol ini untuk menambahkan item menu baru. Anda bisa menambahkan nama, deskripsi, harga, foto, dan kategori menu.',
      position: 'left',
    },
    {
      target: '[data-tour="menu-search"]',
      title: 'Cari Menu',
      description: 'Ketik nama menu untuk mencari dengan cepat. Pencarian akan dilakukan secara real-time saat Anda mengetik.',
      position: 'bottom',
    },
    {
      target: '[data-tour="menu-category-filter"]',
      title: 'Filter & Sortir',
      description: 'Filter menu berdasarkan kategori atau status ketersediaan. Anda juga bisa mengurutkan berdasarkan nama atau harga.',
      position: 'bottom',
    },
    {
      target: '[data-tour="menu-grid"]',
      title: 'Daftar Menu',
      description: 'Semua menu ditampilkan dalam bentuk kartu. Klik tombol toggle hijau/merah untuk mengubah ketersediaan menu secara langsung, atau klik "Edit" untuk mengubah detail menu.',
      position: 'top',
    },
  ],
}

// Tables Page Tour
export const TOUR_TABLES_PAGE: TourConfig = {
  id: 'tour_tables_page',
  name: 'Tutorial Halaman Meja & QR',
  description: 'Pelajari cara mengelola meja dan QR code untuk pemesanan digital',
  category: 'page',
  steps: [
    {
      target: '[data-tour="tables-add-btn"]',
      title: 'Tambah Meja Baru',
      description: 'Klik tombol ini untuk menambahkan meja baru. QR code akan dibuat otomatis untuk setiap meja.',
      position: 'left',
    },
    {
      target: '[data-tour="tables-list"]',
      title: 'Kartu Meja',
      description: 'Setiap kartu menampilkan nomor meja, kapasitas, dan status (Tersedia/Terisi/Dipesan). Klik kartu untuk memilih, lalu gunakan tombol "Kosongkan Meja" untuk mengosongkan meja yang terisi.',
      position: 'top',
    },
    {
      target: '[data-tour="tables-qr-download"]',
      title: 'Lihat & Unduh QR Code',
      description: 'Klik tombol ini untuk melihat QR code meja. Anda bisa mengunduh dan mencetak QR code untuk ditempel di meja restoran.',
      position: 'left',
    },
  ],
}

// Dashboard Page Tour
export const TOUR_DASHBOARD_PAGE: TourConfig = {
  id: 'tour_dashboard_page',
  name: 'Tutorial Halaman Dashboard',
  description: 'Pelajari cara membaca dashboard dan memahami performa bisnis Anda',
  category: 'page',
  steps: [
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Ringkasan Pendapatan',
      description: 'Lihat pendapatan hari ini, perbandingan dengan kemarin, total pesanan, pesanan selesai, dan status pembayaran. Area ini memberikan gambaran cepat performa harian toko Anda.',
      position: 'bottom',
    },
    {
      target: '[data-tour="dashboard-daily-summary"]',
      title: 'Ringkasan Kemarin (AI)',
      description: 'Ringkasan performa kemarin yang dianalisis oleh AI. Lihat total revenue, jumlah pesanan, item terjual, menu terlaris, jam ramai, serta insight dan rekomendasi untuk hari ini. Klik tombol refresh untuk memperbarui analisis.',
      position: 'bottom',
    },
    {
      target: '[data-tour="dashboard-status-cards"]',
      title: 'Status Pesanan Real-time',
      description: 'Empat kartu ini menunjukkan jumlah pesanan berdasarkan status: Perlu Dikonfirmasi (kuning), Sedang Diproses (ungu), Siap Diantar (hijau), dan Selesai Hari Ini. Indikator berkedip menandakan ada pesanan yang perlu diperhatikan.',
      position: 'top',
    },
    {
      target: '[data-tour="dashboard-recent-orders"]',
      title: 'Pesanan Aktif',
      description: 'Daftar pesanan yang sedang berjalan dan perlu diproses. Klik pesanan untuk melihat detail atau ubah status. Anda bisa langsung ke halaman Kelola Pesanan untuk pengelolaan lengkap.',
      position: 'top',
    },
    {
      target: '[data-tour="dashboard-export-btn"]',
      title: 'Export Laporan',
      description: 'Klik tombol ini untuk mengunduh laporan harian dalam format CSV. Laporan berisi ringkasan pendapatan, status pesanan, dan daftar pesanan terbaru.',
      position: 'left',
    },
    {
      target: '[data-tour="dashboard-analytics-link"]',
      title: 'Analisis Lengkap',
      description: 'Klik di sini untuk melihat analitik bisnis yang lebih detail: grafik penjualan, menu terlaris, distribusi jam sibuk, dan insight lainnya.',
      position: 'top',
    },
  ],
}

// Categories Page Tour
export const TOUR_CATEGORIES_PAGE: TourConfig = {
  id: 'tour_categories_page',
  name: 'Tutorial Halaman Kategori',
  description: 'Pelajari cara mengelola kategori untuk mengorganisir menu',
  category: 'page',
  steps: [
    {
      target: '[data-tour="categories-add-btn"]',
      title: 'Tambah Kategori Baru',
      description: 'Klik tombol ini untuk membuat kategori baru seperti Makanan, Minuman, Snack, Dessert, dll. Kategori membantu pelanggan menemukan menu dengan lebih mudah.',
      position: 'left',
    },
    {
      target: '[data-tour="categories-stats"]',
      title: 'Statistik Kategori',
      description: 'Lihat ringkasan kategori: total kategori, kategori aktif, kategori nonaktif, dan total menu. Gunakan informasi ini untuk memantau struktur menu Anda.',
      position: 'bottom',
    },
    {
      target: '[data-tour="categories-filters"]',
      title: 'Filter & Pencarian',
      description: 'Cari kategori dengan nama atau filter berdasarkan status (Aktif/Nonaktif). Kategori nonaktif tidak akan tampil di halaman pemesanan pelanggan.',
      position: 'bottom',
    },
    {
      target: '[data-tour="categories-list"]',
      title: 'Daftar Kategori',
      description: 'Semua kategori ditampilkan di sini berdasarkan abjad. Kategori nonaktif ditandai dengan warna kuning. Klik "Edit" untuk mengubah nama, deskripsi, atau status kategori.',
      position: 'top',
    },
  ],
}

// Analytics Page Tour
export const TOUR_ANALYTICS_PAGE: TourConfig = {
  id: 'tour_analytics_page',
  name: 'Tutorial Halaman Analytics',
  description: 'Pelajari cara membaca analitik dan insight bisnis Anda',
  category: 'page',
  steps: [
    {
      target: '[data-tour="analytics-date-range"]',
      title: 'Filter Periode Waktu',
      description: 'Pilih periode untuk analitik: Hari Ini, Kemarin, 7 Hari, atau 30 Hari. Data akan berubah sesuai periode yang dipilih, termasuk perbandingan dengan periode sebelumnya.',
      position: 'bottom',
    },
    {
      target: '[data-tour="analytics-kpi-cards"]',
      title: 'Indikator Kinerja Utama',
      description: 'Kartu KPI menampilkan metrik penting: Total Pesanan, Rata-rata per Pesanan, Item Terjual, dan Jam Tersibuk. Persentase hijau/merah menunjukkan perbandingan dengan periode sebelumnya.',
      position: 'bottom',
    },
    {
      target: '[data-tour="analytics-payment"]',
      title: 'Status Pembayaran',
      description: 'Pantau pendapatan yang sudah dibayar (hijau) dan yang belum dibayar (kuning). Gunakan ini untuk mengelola cash flow dan follow up pembayaran tertunda.',
      position: 'top',
    },
    {
      target: '[data-tour="analytics-charts"]',
      title: 'Distribusi Pesanan per Jam',
      description: 'Grafik batang menunjukkan waktu-waktu tersibuk. Bar oranye menandai jam puncak. Gunakan insight ini untuk mengoptimalkan jadwal staff dan persiapan dapur.',
      position: 'top',
    },
    {
      target: '[data-tour="analytics-status-chart"]',
      title: 'Status Pesanan',
      description: 'Diagram lingkaran menampilkan distribusi pesanan: Selesai (hijau), Diproses (ungu), Siap (oranye), Pending (kuning), dan Batal (merah). Pantau untuk memastikan operasional berjalan lancar.',
      position: 'top',
    },
    {
      target: '[data-tour="analytics-top-items"]',
      title: 'Menu Terlaris',
      description: 'Lihat 5 menu dengan penjualan tertinggi. Menu dengan icon api adalah yang paling populer. Gunakan data ini untuk menentukan promosi dan pengembangan menu.',
      position: 'top',
    },
    {
      target: '[data-tour="analytics-ai-panel"]',
      title: 'AI Business Analytics',
      description: 'Insight bisnis cerdas dari AI! Dapatkan analisis performa, prediksi minggu depan, strategi harga, dan rekomendasi actionable. Data di-cache 3 jam untuk efisiensi. Klik "Refresh" untuk update manual.',
      position: 'top',
    },
  ],
}

// Settings Page Tour
export const TOUR_SETTINGS_PAGE: TourConfig = {
  id: 'tour_settings_page',
  name: 'Tutorial Halaman Pengaturan',
  description: 'Pelajari cara mengatur informasi dan preferensi toko',
  category: 'page',
  steps: [
    {
      target: '[data-tour="settings-store-info"]',
      title: 'Profil Toko',
      description: 'Lengkapi informasi toko: nama restoran, logo, nomor telepon, alamat, website, dan banner. Informasi ini akan ditampilkan di halaman pemesanan pelanggan.',
      position: 'bottom',
    },
    {
      target: '[data-tour="settings-operation"]',
      title: 'Jam Operasional',
      description: 'Atur jadwal buka-tutup untuk setiap hari. Klik tombol "X" untuk menutup hari tertentu, atau "Buka" untuk membukanya kembali. Jam default adalah 09:00 - 21:00.',
      position: 'top',
    },
    {
      target: '[data-tour="settings-payment"]',
      title: 'Pajak & Biaya Layanan',
      description: 'Atur persentase PPN dan service charge. Lihat contoh kalkulasi di bawah untuk memahami bagaimana biaya ini diterapkan pada pesanan.',
      position: 'top',
    },
    {
      target: '[data-tour="settings-status"]',
      title: 'Status Toko',
      description: 'Toggle untuk membuka atau menutup toko. Saat toko tutup, pelanggan tidak dapat melakukan pemesanan melalui QR Code.',
      position: 'top',
    },
    {
      target: '[data-tour="settings-save-btn"]',
      title: 'Simpan Perubahan',
      description: 'Setelah mengubah pengaturan, klik tombol ini untuk menyimpan. Perubahan pada logo dan banner akan tersimpan otomatis setelah upload.',
      position: 'left',
    },
  ],
}

// AI Assistant Page Tour
export const TOUR_AI_PAGE: TourConfig = {
  id: 'tour_ai_page',
  name: 'Tutorial AI Assistant',
  description: 'Pelajari cara menggunakan AI Assistant untuk membantu bisnis',
  category: 'page',
  steps: [
    {
      target: '[data-tour="ai-quick-actions"]',
      title: 'Aksi Cepat',
      description: 'Klik tombol aksi untuk memulai percakapan dengan topik tertentu: Buat Deskripsi Menu, Saran Menu Baru, Analisis Penjualan, atau Buat Prompt Foto.',
      position: 'bottom',
    },
    {
      target: '[data-tour="ai-chat-messages"]',
      title: 'Area Percakapan',
      description: 'Lihat riwayat percakapan dengan AI Assistant di sini. Pesan Anda di sebelah kanan, balasan AI di sebelah kiri.',
      position: 'top',
    },
    {
      target: '[data-tour="ai-chat-input"]',
      title: 'Kirim Pesan',
      description: 'Ketik pertanyaan atau permintaan Anda di sini. AI akan membantu membuat deskripsi menu, saran menu baru, analisis penjualan, tips bisnis F&B, dan lainnya.',
      position: 'top',
    },
  ],
}

// AI Menu Creator Tour
export const TOUR_AI_MENU_CREATOR: TourConfig = {
  id: 'tour_ai_menu_creator',
  name: 'Tutorial AI Menu Creator',
  description: 'Pelajari cara menggunakan AI untuk membuat ide menu baru',
  category: 'feature',
  steps: [
    {
      target: '[data-tour="ai-cuisine-type"]',
      title: 'Pilih Jenis Kuliner',
      description: 'Pilih jenis kuliner yang ingin Anda buat: Indonesia, Western, Jepang, China, Korea, Italia, Dessert, atau Minuman. AI akan menyesuaikan ide menu dengan karakteristik kuliner yang dipilih.',
      position: 'bottom',
    },
    {
      target: '[data-tour="ai-ingredients"]',
      title: 'Bahan yang Tersedia',
      description: 'Masukkan bahan-bahan yang Anda miliki (opsional). AI akan memprioritaskan penggunaan bahan tersebut dalam resep. Contoh: ayam, bawang putih, kecap manis.',
      position: 'bottom',
    },
    {
      target: '[data-tour="ai-settings"]',
      title: 'Pengaturan Menu',
      description: 'Atur preferensi menu: Target Harga (Budget hingga Luxury), Tingkat Kesulitan (Mudah/Sedang/Sulit), Ukuran Porsi (1-6 porsi), dan Format Output (1 ide, 3 ide, atau set menu lengkap).',
      position: 'top',
      spotlightPadding: 12,
    },
    {
      target: '[data-tour="ai-generate-btn"]',
      title: 'Generate Ide Menu',
      description: 'Klik tombol ini untuk memulai proses AI. AI akan menganalisis preferensi Anda dan menghasilkan ide menu lengkap dengan deskripsi, bahan, estimasi harga, foto AI, dan tips penyajian.',
      position: 'top',
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
  TOUR_AI_MENU_CREATOR,
  TOUR_CATEGORIES_PAGE,
  TOUR_TABLES_PAGE,
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
  if (pathname.includes('/admin/users')) return 'tour_users_page'
  if (pathname.includes('/admin/analytics')) return 'tour_analytics_page'
  if (pathname.includes('/admin/ai')) return 'tour_ai_page'
  if (pathname.includes('/admin/settings')) return 'tour_settings_page'
  return null
}

// Get target page path from tour ID
export function getTourTargetPath(tourId: string): string | null {
  const tourPathMap: Record<string, string> = {
    'tour_dashboard_page': '/admin/dashboard',
    'tour_pos_page': '/admin/pos',
    'tour_orders_page': '/admin/orders',
    'tour_menu_page': '/admin/menu',
    'tour_categories_page': '/admin/categories',
    'tour_tables_page': '/admin/tables',
    'tour_users_page': '/admin/users',
    'tour_analytics_page': '/admin/analytics',
    'tour_ai_page': '/admin/ai',
    'tour_settings_page': '/admin/settings',
  }
  return tourPathMap[tourId] || null
}

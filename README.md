# Police Inventory Management System

Sistem manajemen inventaris kepolisian yang dibangun dengan Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, dan Auth.js.

## 🚀 Fitur Utama

### 🔐 Authentication & User Management
- Login dengan email/password menggunakan Auth.js
- Registrasi user dengan NRP, nama, dan email
- Sistem approval untuk user baru (pending → approved/rejected)
- Role-based access control (RBAC)

### 👥 Roles & Hierarchy
- **Admin** - Akses penuh ke semua fitur
- **Korlantas** - Dapat mengawasi semua Polda
- **Polda** - Dapat mengawasi multiple Polres
- **Polres** - Mengelola asset, laporan, dan user lokal
- **User** - Akses terbatas sesuai role

### 📦 Asset Management
- CRUD operasi untuk asset
- Kategori asset: Kendaraan, Senjata, Peralatan, Komputer, Komunikasi, Lainnya
- Status tracking: Active, Damaged, Transferred, Lost, Maintenance, Retired
- Assignment asset ke user

### 📊 Reporting System
- CRUD operasi untuk laporan
- Export ke PDF/Excel (akan diimplementasikan)
- Review dan edit laporan oleh role yang lebih tinggi

### 📈 Dashboard
- Statistik real-time (total users, assets, reports, polres)
- Grafik distribusi asset berdasarkan status
- Daftar laporan terbaru
- Responsive design dengan sidebar collapsible

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (latest)
- **Database**: MySQL dengan Prisma ORM
- **Authentication**: Auth.js (NextAuth)
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- MySQL database
- npm atau yarn

## 🚀 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd police-inventory
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Buat file `.env.local` dengan konfigurasi berikut:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/police_inventory"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (untuk verifikasi)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@police-inventory.com"
```

4. **Setup database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (opsional)
npx prisma db seed
```

5. **Run development server**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utilities & configurations
│   ├── actions/          # Server actions
│   ├── auth.ts           # Auth.js config
│   └── prisma.ts         # Prisma client
├── types/                # TypeScript types
└── styles/               # Global styles
```

## 🗄️ Database Schema

### Models
- **User**: Pengguna sistem dengan role dan status
- **Polda**: Kepolisian Daerah
- **Polres**: Kepolisian Resor (terhubung ke Polda)
- **Asset**: Inventaris dengan kategori dan status
- **Report**: Laporan yang dibuat oleh user

### Relationships
- Polda → Polres (one-to-many)
- Polres → Users, Assets, Reports (one-to-many)
- User → Reports (one-to-many)
- User → Assets (one-to-many, melalui assignment)

## 🔐 Authentication Flow

1. User registrasi dengan NRP, nama, email, dan password
2. Status user = `PENDING`
3. Admin/Polres menyetujui user
4. User dapat login setelah disetujui
5. Role-based access control diterapkan

## 🎨 UI Components

### Layout Components
- **Sidebar**: Navigasi dengan menu collapsible
- **Navbar**: Header dengan user dropdown
- **Dashboard Layout**: Layout utama dengan sidebar + navbar

### Data Components
- **DataTable**: Tabel dengan pagination, search, filters
- **Form Modal**: Modal untuk CRUD operations
- **Card Summary**: Kartu statistik dashboard
- **Approval Badge**: Badge status user

## 📊 Dashboard Features

### Statistics Cards
- Total Users
- Total Assets  
- Total Reports
- Total Polres

### Charts & Analytics
- Asset status distribution
- Recent reports overview
- User activity (akan diimplementasikan)

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

### Database Commands
```bash
npx prisma studio    # Database GUI
npx prisma migrate   # Run migrations
npx prisma generate  # Generate client
npx prisma db push   # Push schema changes
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository ke Vercel
3. Set environment variables
4. Deploy

### Database Setup
- **Development**: MySQL local
- **Production**: PlanetScale, Railway, atau AWS RDS

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🆘 Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.

---

**Police Inventory Management System** - Sistem manajemen inventaris kepolisian yang modern dan scalable.

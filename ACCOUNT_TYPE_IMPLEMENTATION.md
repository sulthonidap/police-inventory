# Implementasi Jenis Akun (Account Type)

## Overview
Implementasi ini menambahkan fitur jenis akun berdasarkan Google Forms yang memungkinkan pembedaan antara:
- **Anggota** (ANGGOTA): Untuk anggota internal organisasi
- **Pihak Ketiga/Tim Teknis/lainnya** (PIHAK_KETIGA): Untuk eksternal/tim teknis

## Perubahan Database

### Schema Prisma
```prisma
enum AccountType {
  ANGGOTA
  PIHAK_KETIGA
}

model User {
  // ... existing fields
  accountType   AccountType @default(ANGGOTA)
  // ... other fields
}
```

## Perubahan API

### Register API (`/api/auth/register`)
- Menambahkan parameter `accountType` ke request body
- Validasi field `accountType` wajib diisi
- Menyimpan `accountType` ke database

## Perubahan Frontend

### Form Registrasi (`/register`)
- **Field Jenis Akun**: Dropdown dengan pilihan "Anggota" dan "Pihak Ketiga/Tim Teknis/lainnya"
- **Field NRP**: Hanya muncul untuk jenis akun "Anggota"
- **NRP Otomatis**: Untuk pihak ketiga, NRP digenerate dengan format `EXT-{timestamp}`
- **Validasi Dinamis**: Berbeda berdasarkan jenis akun
- **Placeholder Khusus**: Label dan placeholder yang disesuaikan untuk pihak ketiga

### NextAuth Integration
- Menambahkan `accountType` ke session dan JWT
- Update type definitions untuk TypeScript

## Fitur Khusus

### Untuk Anggota (ANGGOTA)
- Wajib mengisi NRP
- Validasi standar untuk semua field
- Label "Alasan Registrasi"

### Untuk Pihak Ketiga (PIHAK_KETIGA)
- NRP otomatis digenerate (EXT-{timestamp})
- **Field tambahan yang wajib diisi:**
  - Nama Perusahaan
  - Nomor Telepon
  - Jenis Aset Korlantas (checkbox dengan pilihan):
    - STLE Statis
    - ETLE Portable
    - ETLE Mobile Handheld
    - STLE Mobile On-Board
    - Yang lain (dengan input text)
  - Wilayah (dropdown Polda)
  - Satwil (dropdown Polres)
- Label "Alasan dan Keterangan"
- Placeholder yang menjelaskan peran sebagai pihak ketiga
- Informasi tambahan tentang tanggung jawab

## Migration
```bash
npx prisma migrate dev --name add_account_type
npx prisma migrate dev --name add_third_party_fields
npx prisma generate
```

## Database Schema Update
```prisma
model User {
  // ... existing fields
  accountType   AccountType @default(ANGGOTA)
  // Fields khusus untuk pihak ketiga
  companyName   String?
  phone         String?
  assetTypes    String? // JSON string untuk array asset types
  otherAssetType String?
  region        String?
  satwil        String?
  // ... other fields
}
```

## Testing
1. Buka halaman `/register`
2. Pilih jenis akun "Anggota" - field NRP akan muncul
3. Pilih jenis akun "Pihak Ketiga" - akan muncul field tambahan:
   - Nama Perusahaan
   - Nomor Telepon
   - Checkbox jenis aset Korlantas
   - Dropdown wilayah dan satwil
4. Submit form dan periksa data di database

## Dependencies
```bash
npm install @radix-ui/react-checkbox
```

## Catatan
- Semua user yang sudah ada akan memiliki `accountType` default "ANGGOTA"
- Field `accountType` tersedia di session untuk digunakan di seluruh aplikasi
- Validasi disesuaikan berdasarkan jenis akun yang dipilih

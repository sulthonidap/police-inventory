# Admin Setup API Endpoint

## Endpoint
```
POST /api/admin/setup
GET /api/admin/setup
```

## Deskripsi
Endpoint khusus untuk membuat user admin yang sudah langsung di-approve tanpa perlu approval manual.

## Keamanan
- Memerlukan secret key untuk mencegah abuse
- Secret key default: `admin-setup-2024`
- Bisa diubah via environment variable `ADMIN_SETUP_SECRET`

## POST Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "name": "Administrator",
  "email": "admin@police-inventory.com",
  "password": "admin123456",
  "nrp": "ADMIN001",
  "secretKey": "admin-setup-2024"
}
```

### Field Requirements
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Nama lengkap admin |
| `email` | string | ✅ | Email admin (harus unik) |
| `password` | string | ✅ | Password minimal 8 karakter |
| `nrp` | string | ✅ | NRP admin (harus unik) |
| `secretKey` | string | ✅ | Secret key untuk keamanan |

### Validasi
- Email harus format valid
- Password minimal 8 karakter
- Email dan NRP harus unik
- Secret key harus sesuai

## Response

### Success (201)
```json
{
  "success": true,
  "message": "Admin user berhasil dibuat dan langsung di-approve",
  "user": {
    "id": "clx1234567890",
    "name": "Administrator",
    "email": "admin@police-inventory.com",
    "nrp": "ADMIN001",
    "role": "ADMIN",
    "status": "APPROVED",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error (400)
```json
{
  "error": "Semua field wajib diisi: name, email, password, nrp, secretKey"
}
```

### Error (401)
```json
{
  "error": "Secret key tidak valid"
}
```

## GET Request

### Response
```json
{
  "message": "Admin Setup Endpoint",
  "description": "POST ke endpoint ini untuk membuat user admin yang sudah di-approve",
  "required_fields": {
    "name": "string - Nama lengkap admin",
    "email": "string - Email admin (harus unik)",
    "password": "string - Password minimal 8 karakter",
    "nrp": "string - NRP admin (harus unik)",
    "secretKey": "string - Secret key untuk keamanan"
  },
  "example": {
    "name": "Administrator",
    "email": "admin@police-inventory.com",
    "password": "admin123456",
    "nrp": "ADMIN001",
    "secretKey": "admin-setup-2024"
  },
  "note": "Secret key default: admin-setup-2024 (bisa diubah via environment variable ADMIN_SETUP_SECRET)"
}
```

## Contoh Penggunaan

### cURL
```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "superadmin@police-inventory.com",
    "password": "superadmin123",
    "nrp": "SUPER001",
    "secretKey": "admin-setup-2024"
  }'
```

### Postman
1. Method: `POST`
2. URL: `http://localhost:3000/api/admin/setup`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "Super Admin",
  "email": "superadmin@police-inventory.com",
  "password": "superadmin123",
  "nrp": "SUPER001",
  "secretKey": "admin-setup-2024"
}
```

### JavaScript/Fetch
```javascript
const response = await fetch('/api/admin/setup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Super Admin",
    email: "superadmin@police-inventory.com",
    password: "superadmin123",
    nrp: "SUPER001",
    secretKey: "admin-setup-2024"
  })
});

const result = await response.json();
console.log(result);
```

## Environment Variables

### ADMIN_SETUP_SECRET
```bash
# .env.local
ADMIN_SETUP_SECRET="your-custom-secret-key-here"
```

## Catatan Penting
- Endpoint ini hanya untuk setup awal atau emergency
- Jangan gunakan di production tanpa secret key yang kuat
- User yang dibuat langsung memiliki role ADMIN dan status APPROVED
- Password di-hash menggunakan bcrypt dengan salt 12
- Response tidak menyertakan password untuk keamanan

## Error Codes
- `P2002`: Email atau NRP sudah terdaftar
- `P1001`: Database connection failed
- Custom errors untuk validasi field dan secret key

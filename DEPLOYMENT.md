# 🚀 Deployment Guide - Police Inventory System

## **Deploy ke Vercel**

### **1. Persiapan Repository**
```bash
# Pastikan semua perubahan sudah di-commit
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### **2. Deploy ke Vercel**
1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub/GitLab
3. Import project dari repository
4. Konfigurasi environment variables

### **3. Environment Variables di Vercel**
Set environment variables berikut di dashboard Vercel:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-here

# Database (VPS)
DATABASE_URL=mysql://username:password@your-vps-ip:3306/police_inventory

# Environment
NODE_ENV=production
```

### **4. Konfigurasi Database VPS**

#### **A. Buat Database di VPS**
```sql
CREATE DATABASE police_inventory;
CREATE USER 'police_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON police_inventory.* TO 'police_user'@'%';
FLUSH PRIVILEGES;
```

#### **B. Update Firewall VPS**
```bash
# Buka port MySQL untuk Vercel
sudo ufw allow from 0.0.0.0/0 to any port 3306
```

#### **C. Update MySQL Configuration**
```bash
# Edit /etc/mysql/mysql.conf.d/mysqld.cnf
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Ubah bind-address
bind-address = 0.0.0.0

# Restart MySQL
sudo systemctl restart mysql
```

### **5. Deploy Database Schema**
```bash
# Di local machine
npx prisma db push --schema=./prisma/schema.prisma

# Atau generate migration
npx prisma migrate deploy
```

### **6. Test Deployment**
1. Buka aplikasi di Vercel
2. Test login/logout
3. Test semua fitur utama
4. Periksa console untuk error

## **🔧 Troubleshooting**

### **Error Database Connection**
- Periksa firewall VPS
- Pastikan user database memiliki akses dari external IP
- Test koneksi dari local machine

### **Error NextAuth**
- Periksa NEXTAUTH_URL (harus https)
- Generate NEXTAUTH_SECRET baru
- Periksa callback URLs

### **Performance Issues**
- Enable Vercel Analytics
- Optimize images
- Use CDN untuk static assets

## **📱 Post-Deployment**

### **1. Setup Domain Custom (Optional)**
1. Tambahkan domain di Vercel
2. Update DNS records
3. Update NEXTAUTH_URL

### **2. Monitoring**
- Setup Vercel Analytics
- Monitor database performance
- Setup error tracking

### **3. Backup Strategy**
- Setup automated database backup
- Document recovery procedures
- Test restore process

## **✅ Checklist Deployment**

- [ ] Repository updated dan pushed
- [ ] Environment variables set di Vercel
- [ ] Database VPS configured
- [ ] Firewall updated
- [ ] Database schema deployed
- [ ] Application tested
- [ ] Domain configured (optional)
- [ ] Monitoring setup
- [ ] Backup strategy implemented

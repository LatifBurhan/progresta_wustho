# Testing Guide - Employee Progress Tracker

## ✅ Setup Berhasil!

Aplikasi sudah berjalan di: **http://localhost:3001**

## 🧪 Langkah Testing

### 1. **Registrasi User Pertama**
- Buka http://localhost:3001
- Klik "Daftar di sini"
- Isi form registrasi dengan:
  - Nama: Admin Test
  - Email: admin@test.com
  - Password: 123456
- Setelah registrasi, Anda akan melihat halaman "Menunggu Persetujuan"

### 2. **Approve User Pertama (Jadikan PM)**
Jalankan query SQL ini di Supabase Dashboard atau gunakan tool MCP:

```sql
-- Cari user yang baru didaftar
SELECT id, email, name, status_pending FROM users WHERE email = 'admin@test.com';

-- Approve dan jadikan PM
UPDATE users 
SET status_pending = false, 
    role = 'PM', 
    division_id = (SELECT id FROM divisions WHERE name = 'Management' LIMIT 1)
WHERE email = 'admin@test.com';
```

### 3. **Login sebagai PM**
- Refresh halaman atau login ulang
- Sekarang Anda bisa mengakses semua fitur PM

### 4. **Test Fitur PM**
- **Kelola User**: Buat user baru dan approve mereka
- **Kelola Divisi**: Tambah divisi baru
- **Assign Projects**: Assign proyek ke user

### 5. **Test Fitur Employee**
- Daftar user baru dengan email berbeda
- Approve sebagai Karyawan
- Login dan test:
  - Buat laporan progress
  - Upload foto
  - Test periode waktu berbeda
  - Test multiple projects dalam satu laporan

### 6. **Test Mobile Interface**
- Buka di browser mobile atau gunakan DevTools mobile view
- Test semua fitur dalam mode mobile
- Test PWA installation (Add to Home Screen)

## 📊 Data Sample yang Sudah Ada

### Divisi:
- Web Development
- Mobile Development  
- UI/UX Design
- AI Team
- Management

### Proyek:
- Website Company Profile (PT. ABC Indonesia)
- Mobile App E-Commerce (Toko Online XYZ)
- Dashboard Analytics (PT. Data Solutions)
- Landing Page Campaign (Marketing Agency)
- API Integration (Fintech Startup)

## 🔧 Troubleshooting

### Jika ada error saat registrasi:
1. Cek apakah trigger `handle_new_user` berfungsi
2. Cek RLS policies
3. Cek di Supabase Dashboard → Authentication → Users

### Jika foto tidak bisa diupload:
1. Buat storage bucket `report-photos` di Supabase
2. Set bucket sebagai public
3. Tambahkan storage policies

### Jika PWA tidak bisa diinstall:
1. Ganti placeholder icon files di `/public/`
2. Test di HTTPS (deploy ke Vercel)

## 🚀 Next Steps

1. **Deploy ke Vercel**:
   - Push ke GitHub
   - Connect ke Vercel
   - Add environment variables

2. **Buat Icon PWA**:
   - Buat icon 192x192 dan 512x512
   - Replace file di `/public/`

3. **Test Production**:
   - Test PWA installation
   - Test offline functionality
   - Test mobile performance

## 📱 Fitur yang Bisa Ditest

- ✅ Authentication (Login/Register)
- ✅ Role-based access (Karyawan/PM/CEO)
- ✅ Division management
- ✅ Project management
- ✅ Multi-project reports
- ✅ Photo upload & compression
- ✅ Auto-save drafts
- ✅ WhatsApp copy functionality
- ✅ Mobile-first responsive design
- ✅ Infinite scroll feed
- ✅ Jakarta timezone
- ✅ Overtime detection
- ✅ Issue flagging (red warning icons)

Selamat mencoba! 🎉
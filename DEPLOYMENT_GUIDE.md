# 🚀 HƯỚNG DẪN DEPLOY PICKLEBALL PROJECT

## 📋 Yêu cầu
- GitHub account
- Railway account (railway.app)
- Vercel account (vercel.com)

---

## BƯỚC 1: CHUẨN BỊ GIT & GITHUB

### 1.1 Khởi tạo Git
```bash
cd DoAnQuanLyPickleBall-main
git init
git add .
git commit -m "Initial commit - Pickleball management system"
git branch -M main
```

### 1.2 Tạo Repository trên GitHub
1. Vào https://github.com/new
2. Điền:
   - **Repository name:** `DoAnQuanLyPickleBall`
   - **Description:** Hệ thống quản lý Pickleball
   - **Public:** Yes
3. Click **Create repository**

### 1.3 Push lên GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/DoAnQuanLyPickleBall.git
git push -u origin main
```

✅ Code đã trên GitHub!

---

## BƯỚC 2: DEPLOY BACKEND LÊN RAILWAY

### 2.1 Tạo Project trên Railway
1. Vào https://railway.app
2. Login với GitHub
3. Click **Create New Project**
4. Chọn **Deploy from GitHub repo**
5. Chọn repo `DoAnQuanLyPickleBall`
6. Railway sẽ tự deploy backend

### 2.2 Thêm MySQL Database
1. Trong Railway Dashboard → Click **+ New Service**
2. Chọn **MySQL**
3. Chờ status **✓ Running**

### 2.3 Setup Environment Variables

**Lấy info từ MySQL service:**
1. Click MySQL → **Variables**
2. Copy các thông tin

**Thêm vào Backend service - Variables:**
```
MYSQLHOST=<value từ MySQL>
MYSQLUSER=<value từ MySQL>
MYSQLPASSWORD=<value từ MySQL>
MYSQLDATABASE=pickleball
MYSQLPORT=<value từ MySQL>
PORT=3000
NODE_ENV=production
```

### 2.4 Import Database Schema
Sử dụng command line:
```bash
mysql -h RAILWAY_HOST -P RAILWAY_PORT -u RAILWAY_USER -p pickleball < pickleball.sql
```

Hoặc upload file `pickleball.sql` trong MySQL service Data tab.

✅ Backend chạy tại: `https://your-project.railway.app`

---

## BƯỚC 3: DEPLOY FRONTEND LÊN VERCEL

### 3.1 Build Frontend
```bash
cd frontend
npm run build
cd ..
```

### 3.2 Deploy trên Vercel
1. Vào https://vercel.com
2. Login với GitHub
3. Click **New Project**
4. Chọn repo `DoAnQuanLyPickleBall`
5. **Framework Preset:** Vite
6. **Root Directory:** `frontend`
7. Click **Deploy**

### 3.3 Thêm Environment Variables
1. Vercel Dashboard → Settings → Environment Variables
2. Thêm:
   ```
   VITE_API_URL=https://your-railway-backend.railway.app
   ```

✅ Frontend chạy tại: `https://doanquanly-xxx.vercel.app`

---

## BƯỚC 4: CẬP NHẬT CODE FRONTEND (LẦN ĐẦUU)

Cần tìm và sửa các file gọi API để dùng `VITE_API_URL`:

**Tạo file config:**
```javascript
// frontend/src/config/api.js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

**Cập nhật các file gọi API:**
```javascript
import { API_URL } from '../config/api';

// Thay vì: axios.get('http://localhost:3000/api/...')
// Thành:
axios.get(`${API_URL}/api/...`)
```

**Push lên GitHub:**
```bash
git add .
git commit -m "Add API config for production"
git push origin main
```

Vercel sẽ tự động redeploy!

---

## ✅ KIỂM TRA

1. **Backend API:** `https://your-railway-backend.railway.app/`
   - Kết quả: " Pickleball Backend đang chạy!"

2. **Backend API:** `https://your-railway-backend.railway.app/api/client/categories`
   - Kết quả: JSON danh sách categories

3. **Frontend:** `https://doanquanly-xxx.vercel.app`
   - Mở browser và test các chức năng

---

## 🔗 URL CUỐI CÙNG

- 🌐 **Web App:** `https://doanquanly-xxx.vercel.app`
- 🔌 **API:** `https://your-railway-backend.railway.app`
- 💾 **Database:** Railway MySQL

---

## ⚠️ LƯU Ý

- **Uploads Images:** Hiện tại lưu local, cần upgrade để lưu S3/Cloudinary
- **CORS:** Đã setup, frontend có thể gọi từ bất kỳ domain
- **Railway Free:** 500 credits/tháng, đủ cho dự án nhỏ
- **Vercel Free:** Miễn phí, tự động HTTPS, CDN global

---

## 🐛 TROUBLESHOOTING

### Backend không kết nối database
- Kiểm tra Environment Variables trên Railway
- Verify MySQL service status
- Check `.env.example` có đầy đủ biến

### Frontend gọi API bị CORS error
- Kiểm tra `VITE_API_URL` trong Vercel Environment Variables
- Verify backend có `cors()` middleware

### Hình ảnh không hiển thị
- Hình ảnh cần upload S3 hoặc Cloudinary
- Hoặc sửa lại code backend để support cloud storage

---

**Hỏi nếu có vấn đề! 🚀**

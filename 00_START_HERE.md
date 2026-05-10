# 🚀 PICKLEBALL PROJECT - DEPLOY GUIDE

**Tất cả file cần thiết đã được tạo!** ✅

---

## 📁 FILE ĐƯỢC TẠO

| File | Mục đích |
|------|---------|
| `backend/.env.example` | Template biến môi trường backend |
| `frontend/.env.example` | Template biến môi trường frontend |
| `frontend/src/config/api.js` | Config API URL cho frontend |
| `.gitignore` | Ignore files khi push Git |
| `DEPLOYMENT_GUIDE.md` | Hướng dẫn deploy chi tiết (30 phút) |
| `SETUP_LOCAL.md` | Hướng dẫn setup máy local |
| `API_UPDATE_GUIDE.md` | Hướng dẫn cập nhật 24 file API calls |
| `update-api-calls.js` | Script giúp add imports (optional) |

---

## ⚡ QUICK START - 5 BƯỚC CHÍNH

### 1️⃣ CẬP NHẬT API CALLS (15 phút)

**Mục đích:** Thay đổi từ `/api/...` thành `${API_URL}/api/...`

- [ ] Đọc file: `API_UPDATE_GUIDE.md`
- [ ] Cập nhật 24 file như hướng dẫn
- [ ] Git push: `git add . && git commit -m "Update API URLs" && git push`

### 2️⃣ PUSH CODE LÊN GITHUB (5 phút)

```bash
cd DoAnQuanLyPickleBall-main

# Khởi tạo Git
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main

# Tạo repo trên https://github.com/new
# Thay YOUR_USERNAME và YOUR_REPO
git remote add origin https://github.com/YOUR_USERNAME/DoAnQuanLyPickleBall.git
git push -u origin main
```

✅ Code đã trên GitHub!

### 3️⃣ DEPLOY BACKEND + DATABASE LÊN RAILWAY (10 phút)

- [ ] Vào: https://railway.app
- [ ] Login GitHub
- [ ] New Project → Deploy from GitHub
- [ ] Chọn repo `DoAnQuanLyPickleBall`
- [ ] Thêm MySQL service
- [ ] Setup Environment Variables (xem `DEPLOYMENT_GUIDE.md`)
- [ ] Import database: `mysql -h RAILWAY_HOST -u USER -p DB < pickleball.sql`
- [ ] Copy Backend URL: `https://your-railway-app.railway.app`

### 4️⃣ DEPLOY FRONTEND LÊN VERCEL (10 phút)

- [ ] Build: `cd frontend && npm run build && cd ..`
- [ ] Vào: https://vercel.com
- [ ] Login GitHub
- [ ] New Project → Chọn repo
- [ ] Framework: Vite, Root Directory: frontend
- [ ] Add Environment Variable: `VITE_API_URL=<Railway Backend URL>`
- [ ] Deploy
- [ ] Copy Frontend URL: `https://doanquanly-xxx.vercel.app`

### 5️⃣ TEST (5 phút)

- [ ] Backend: `https://your-railway-backend.railway.app/`
- [ ] API: `https://your-railway-backend.railway.app/api/client/categories`
- [ ] Frontend: `https://doanquanly-xxx.vercel.app`
- [ ] Test tất cả chức năng

---

## 📋 CHECKLIST ĐẦY ĐỦ

### ✅ Chuẩn bị

- [x] File `.env.example` tạo
- [x] File `api.js` config tạo
- [x] File hướng dẫn tạo
- [ ] API calls được cập nhật
- [ ] Code được push GitHub

### ✅ GitHub

- [ ] Repo được tạo
- [ ] Code được push

### ✅ Railway Backend + Database

- [ ] Project tạo trên Railway
- [ ] MySQL service thêm
- [ ] Environment variables setup
- [ ] Database imported
- [ ] Backend URL được copy

### ✅ Vercel Frontend

- [ ] Frontend build
- [ ] Project tạo trên Vercel
- [ ] Environment variable setup
- [ ] Frontend URL được copy

### ✅ Testing

- [ ] Backend API hoạt động
- [ ] Frontend hiển thị
- [ ] API calls từ frontend đi đến Railway
- [ ] Tất cả chức năng test OK

---

## 🔗 FINAL URLS

```
🌐 Frontend: https://doanquanly-xxx.vercel.app
🔌 Backend:  https://your-railway-backend.railway.app
💾 Database: Railway MySQL (tự động)
```

---

## 📖 THAM KHẢO

- **Setup Local:** `SETUP_LOCAL.md`
- **Deploy Detail:** `DEPLOYMENT_GUIDE.md`
- **API Updates:** `API_UPDATE_GUIDE.md`
- **API Config:** `frontend/src/config/api.js`

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Cập nhật API URLs** - Cần thiết để Frontend trên Vercel gọi đúng Backend trên Railway
2. **Environment Variables** - Kiểm tra kỹ trên Railway & Vercel
3. **Database Import** - Phải import `pickleball.sql` vào Railway MySQL
4. **CORS** - Backend đã setup, không cần lo

---

## 💬 TROUBLESHOOTING

### ❌ Frontend CORS error
→ Kiểm tra `VITE_API_URL` trong Vercel Environment Variables

### ❌ Backend database connection error
→ Kiểm tra Environment Variables trên Railway MySQL service

### ❌ Hình ảnh không hiển thị
→ Cần setup AWS S3 hoặc Cloudinary (chưa làm, nếu cần hỏi sau)

### ❌ Vercel redeploy không auto
→ Manual push lên GitHub: `git push origin main`

---

**Bắt đầu từ BƯỚC 1 ngay! Hỏi nếu có vấn đề! 🚀**

---

## 👨‍💻 SUPPORT

Nếu gặp lỗi:
1. Kiểm tra file hướng dẫn chi tiết
2. Đọc error message trên Railway/Vercel dashboard
3. Hỏi tôi với chi tiết error

**Happy Deployment! 🎉**

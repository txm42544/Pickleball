# 🏠 HƯỚNG DẪN SETUP LOCAL (Máy cá nhân)

## Yêu cầu
- Node.js v18+ (download từ nodejs.org)
- MySQL + XAMPP hoặc MySQL Workbench
- Git

---

## BƯỚC 1: SETUP DATABASE LOCAL

### 1.1 Mở XAMPP → Start Apache + MySQL

### 1.2 Import Database
```bash
# Mở phpMyAdmin: http://localhost/phpmyadmin
# Hoặc dùng command line:
mysql -u root -p < pickleball.sql
```

---

## BƯỚC 2: SETUP BACKEND

### 2.1 Cài dependencies
```bash
cd backend
npm install
```

### 2.2 Tạo file .env
Copy từ `.env.example` (đã có sẵn):
```bash
cp .env.example .env
```

### 2.3 Chạy server
```bash
npm start
# Server chạy tại http://localhost:3000
```

---

## BƯỚC 3: SETUP FRONTEND

### 3.1 Cài dependencies
```bash
cd ../frontend
npm install
```

### 3.2 Chạy dev server
```bash
npm run dev
# Frontend chạy tại http://localhost:5173
```

---

## ✅ Kiểm tra

1. Backend: http://localhost:3000 → " Pickleball Backend đang chạy!"
2. Frontend: http://localhost:5173 → Trang web hiển thị
3. API: http://localhost:3000/api/client/categories → JSON danh sách

---

## 📝 Các lệnh hữu ích

```bash
# Root folder
npm start          # Chạy backend
npm run dev        # Chạy frontend

# Backend folder
npm start          # Chạy server
npm run dev        # Chạy server (alias)

# Frontend folder
npm run dev        # Dev server
npm run build      # Build production
npm run preview    # Preview build
npm run lint       # Kiểm tra code style
```

---

**Xong! Giờ có thể phát triển project locally! 🚀**

# 📝 HƯỚNG DẪN CẬP NHẬT API CALLS

## ⚠️ QUAN TRỌNG

Khi deploy Frontend trên Vercel + Backend trên Railway, axios sẽ gọi tới **domain của Vercel**, không phải Railway!

Nếu frontend dùng `/api/products`, khi chạy trên Vercel nó sẽ gọi:
```
https://doanquanly-xxx.vercel.app/api/products  ❌ WRONG!
```

Cần phải gọi tới:
```
https://your-railway-backend.railway.app/api/products  ✅ CORRECT!
```

---

## ✅ GIẢI PHÁP: Sử dụng `API_URL` từ config

**File config đã tạo:** `frontend/src/config/api.js`
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

---

## 🛠️ CÁC BƯỚC CẬP NHẬT

### Bước 1: Import API_URL vào các file

Mở file cần sửa và thêm ở đầu:
```javascript
import { API_URL } from '../config/api';  // Adjust path based on file location
```

**File nằm ở độ sâu khác nhau:**
- `src/components/*.jsx` → `import { API_URL } from '../config/api';`
- `src/pages/customers/*.jsx` → `import { API_URL } from '../../config/api';`
- `src/pages/managers/*.jsx` → `import { API_URL } from '../../config/api';`
- `src/pages/employees/*.jsx` → `import { API_URL } from '../../config/api';`
- `src/pages/login/*.jsx` → `import { API_URL } from '../../config/api';`
- `src/context/*.jsx` → `import { API_URL } from '../config/api';`

### Bước 2: Thay thế API URLs

**Tìm & Thay trong VS Code:**

1. Mở file cần sửa
2. Ctrl+H (Find & Replace)
3. Tìm: `axios.get('\/api\/`
4. Thay: `axios.get(\`\${API_URL}\/api\/`
5. Repeat cho `axios.post`, `axios.put`, `axios.delete`, `fetch`

**Ví dụ cụ thể:**

```javascript
// ❌ Cũ:
axios.get('/api/products')
axios.post('/api/orders', data)
fetch('/api/categories')

// ✅ Mới:
axios.get(`${API_URL}/api/products`)
axios.post(`${API_URL}/api/orders`, data)
fetch(`${API_URL}/api/categories`)
```

---

## 📋 DANH SÁCH 24 FILE CẦN CẬP NHẬT

### Components (1 file)
- [ ] `src/context/CartContext.jsx` - Sử dụng 7 API calls

### Customer Pages (7 files)
- [ ] `src/pages/customers/Checkout.jsx`
- [ ] `src/pages/customers/BookingHistory.jsx`
- [ ] `src/pages/customers/ProductDetail.jsx`
- [ ] `src/pages/customers/PurchaseHistory.jsx`
- [ ] `src/pages/customers/Shop.jsx`
- [ ] `src/pages/customers/POS.jsx`
- [ ] `src/pages/customers/OrderComplete.jsx`

### Manager/Admin Pages (9 files)
- [ ] `src/pages/managers/AdminHome.jsx`
- [ ] `src/pages/managers/AdminDashboard.jsx`
- [ ] `src/pages/managers/AdminCategories.jsx`
- [ ] `src/pages/managers/AdminProducts.jsx`
- [ ] `src/pages/managers/AdminOrders.jsx`
- [ ] `src/pages/managers/DatSanNgay.jsx`
- [ ] `src/pages/managers/DatSanThang.jsx`
- [ ] `src/pages/managers/QuanLySan.jsx`
- [ ] `src/pages/managers/QuanLyTaiKhoan.jsx`

### Manager Other Pages (4 files)
- [ ] `src/pages/managers/LichSuNhapHang.jsx`
- [ ] `src/pages/managers/QuanLyNhaCungCap.jsx`
- [ ] `src/pages/managers/XacNhanDatSan.jsx`
- [ ] `src/pages/managers/CaLam.jsx` (sai folder, nên là `src/pages/employees/CaLam.jsx`)

### Employee Pages (1 file)
- [ ] `src/pages/employees/CaLam.jsx`

### Other Components (2 files)
- [ ] `src/components/NotificationBell.jsx`
- [ ] `src/components/ProfilePage.jsx`

### Login Pages (3 files)
- [ ] `src/pages/login/Login.jsx`
- [ ] `src/pages/login/Register.jsx`
- [ ] `src/pages/login/ForgotPassword.jsx`

---

## ⚡ CÁCH NHANH NHẤT (Dùng Find & Replace)

**Trong VS Code:**

1. Ctrl+H (mở Find & Replace)
2. **Regex** toggle: ON (click icon `.*`)
3. **Find:** `axios\.get\(['"\`]/api/`
4. **Replace:** `axios.get(\`\${API_URL}/api/`
5. Repeat cho `axios.post`, `axios.put`, `axios.delete`

**Hoặc dùng VS Code Multi-line Replace:**
```
Find:    '\/api\/
Replace: \`\${API_URL}\/api\/
```

---

## 💾 SAU KHI CẬP NHẬT

```bash
# Commit changes
git add .
git commit -m "Update API URLs to use VITE_API_URL config"

# Push
git push origin main
```

Vercel sẽ tự động redeploy!

---

## ✅ KIỂM TRA

1. Chạy local: `npm run dev` → Vẫn gọi `http://localhost:3000`
2. Deploy Vercel: Sẽ gọi `https://your-railway-backend.railway.app`

**LƯU Ý:** Frontend + Backend không cần trong cùng domain!

---

**Hỏi nếu có vấn đề!** 🚀

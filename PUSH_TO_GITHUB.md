# 🚀 PUSH CODE LÊN GITHUB

**Code đã được commit và sẵn sàng!** ✅

---

## ✅ Đã hoàn thành:

- ✅ 24+ file frontend được cập nhật API calls
- ✅ Import `API_URL` được thêm vào tất cả files
- ✅ Relative paths `/api/...` được đổi thành `${API_URL}/api/...`
- ✅ Các file `.env.example` được tạo
- ✅ Config file `frontend/src/config/api.js` được tạo
- ✅ Git initialized và commit được tạo

---

## 📝 BƯỚC CUỐI: Push lên GitHub

### 1️⃣ Tạo Repository trên GitHub

1. Vào: https://github.com/new
2. Điền:
   - **Repository name:** `DoAnQuanLyPickleBall`
   - **Description:** Hệ thống quản lý Pickleball
   - **Public:** Yes
3. Click **Create repository**

### 2️⃣ Copy URL repo

**GitHub sẽ show URL như thế này:**
```
https://github.com/YOUR_USERNAME/DoAnQuanLyPickleBall.git
```

### 3️⃣ Push code (chạy lệnh này)

Mở PowerShell tại folder này (`DoAnQuanLyPickleBall-main`):

```bash
git remote add origin https://github.com/YOUR_USERNAME/DoAnQuanLyPickleBall.git
git push -u origin main
```

**Thay `YOUR_USERNAME` bằng username GitHub của bạn!**

### 4️⃣ Confirm

Nếu thành công, GitHub sẽ show:
```
To https://github.com/YOUR_USERNAME/DoAnQuanLyPickleBall.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## ✅ XONG! Bây giờ:

1. **Backend + Database:** Deploy trên Railway (xem `DEPLOYMENT_GUIDE.md`)
2. **Frontend:** Deploy trên Vercel

---

## 💡 LƯU Ý

- **GitHub User:** Nếu chưa setup SSH, GitHub sẽ hỏi username + Personal Access Token
- **Personal Access Token:** 
  1. Vào: https://github.com/settings/tokens
  2. Click **Generate new token**
  3. Select `repo` scope
  4. Copy token → Paste vào terminal khi GitHub hỏi password

---

## 🎯 FINAL CHECKLIST

- [ ] Repository tạo trên GitHub
- [ ] Code push lên GitHub successfully
- [ ] Deploy Backend lên Railway
- [ ] Deploy Frontend lên Vercel
- [ ] Add `VITE_API_URL` Environment Variable trên Vercel
- [ ] Test website

---

**READY TO GO! 🚀**

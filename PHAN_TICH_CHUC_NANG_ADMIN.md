# PHÂN TÍCH CHI TIẾT CHỨC NĂNG ADMIN

## 1. CHỨC NĂNG: XEM DASHBOARD THỐNG KÊ

| Yếu tố | Chi tiết |
|--------|---------|
| **Mã chức năng** | AD001 |
| **Tên chức năng** | Xem Dashboard Thống kê |
| **Mô tả** | Hiển thị tổng quan doanh thu, số lượng booking, thống kê chi tiết theo loại đặt sân |
| **Tác nhân** | Admin (Quản lý) |
| **Điều kiện tiên quyết** | - Đã đăng nhập với role "Quản lý"<br/>- Có dữ liệu booking trong hệ thống |
| **Input** | Không có (tự động lấy từ DB) |
| **Output** | - Tổng doanh thu tháng<br/>- Doanh thu đặt sân ngày<br/>- Doanh thu đặt sân tháng<br/>- Tổng số booking<br/>- Số booking sân ngày<br/>- Số booking sân tháng<br/>- Biểu đồ thống kê |
| **Quy trình** | 1. Admin truy cập route `/dashboard`<br/>2. Component AdminDashboard load<br/>3. Gọi API GET `/api/admin/san` lấy sân và booking<br/>4. Gọi API GET `/api/admin/santhang/list` lấy booking sân tháng<br/>5. Tính toán doanh thu từ các booking<br/>6. Hiển thị biểu đồ và thống kê |
| **Xử lý ngoại lệ** | - Nếu API lỗi: Hiển thị "Không thể tải dữ liệu"<br/>- Nếu không có booking: Hiển thị 0 |
| **Dữ liệu liên quan** | tbl_datsan, tbl_datsanthang, tbl_san |
| **API sử dụng** | GET `/api/admin/san`<br/>GET `/api/admin/santhang/list` |
| **Biểu đồ sử dụng** | Bar Chart, Line Chart, Doughnut Chart, Pie Chart, PolarArea Chart |

---

## 2. CHỨC NĂNG: QUẢN LÝ SÂN (CRUD)

| Yếu tố | Chi tiết |
|--------|---------|
| **Mã chức năng** | AD002 |
| **Tên chức năng** | Quản lý Sân Pickleball |
| **Mô tả** | Thêm, sửa, xóa, xem danh sách sân, cập nhật giá thuê |
| **Tác nhân** | Admin |
| **Điều kiện tiên quyết** | Đã đăng nhập với role "Quản lý" |
| **Input (thêm/sửa)** | - Mã sân (MaSan) - độc nhất<br/>- Tên sân (TenSan)<br/>- Loại sân (LoaiSan): "Thường" hoặc "VIP"<br/>- Giá thuê trước 16h (GiaThueTruoc16)<br/>- Giá thuê sau 16h (GiaThueSau16)<br/>- Trạng thái (TrangThai): "Hoạt động" hoặc "Đóng cửa" |
| **Output** | - Danh sách sân (Xem)<br/>- Thông báo thành công/lỗi |
| **Validation** | - MaSan: không rỗng, độc nhất<br/>- TenSan: không rỗng, <= 100 ký tự<br/>- GiaThueTruoc16: > 0, số nguyên<br/>- GiaThueSau16: > 0, số nguyên<br/>- LoaiSan: chỉ "Thường" hoặc "VIP" |
| **Quy trình Xem** | 1. Admin click menu "Quản lý sân"<br/>2. API GET `/api/admin/san`<br/>3. Hiển thị bảng danh sách sân |
| **Quy trình Thêm** | 1. Click "Thêm sân"<br/>2. Điền form<br/>3. Validate dữ liệu<br/>4. POST `/api/admin/san`<br/>5. Thêm sân vào DB<br/>6. Refresh danh sách |
| **Quy trình Sửa** | 1. Click "Sửa" trên sân<br/>2. Mở form với dữ liệu cũ<br/>3. Thay đổi thông tin<br/>4. PUT `/api/admin/san/:maSan`<br/>5. Cập nhật DB<br/>6. Refresh danh sách |
| **Quy trình Xóa** | 1. Click "Xóa" trên sân<br/>2. Hiển thị xác nhận<br/>3. DELETE `/api/admin/san/:maSan`<br/>4. Xóa từ DB<br/>5. Refresh danh sách |
| **Xử lý ngoại lệ** | - MaSan trùng: "Mã sân đã tồn tại"<br/>- Giá <= 0: "Giá phải > 0"<br/>- Sân có booking: Hiển thị cảnh báo |
| **Dữ liệu liên quan** | tbl_san |
| **API sử dụng** | GET `/api/admin/san`<br/>POST `/api/admin/san`<br/>PUT `/api/admin/san/:maSan`<br/>DELETE `/api/admin/san/:maSan` |

---

## 3. CHỨC NĂNG: QUẢN LÝ DANH MỤC (CRUD)

| Yếu tố | Chi tiết |
|--------|---------|
| **Mã chức năng** | AD003 |
| **Tên chức năng** | Quản lý Danh mục |
| **Mô tả** | Thêm, sửa, xóa, xem danh mục (hiện tại chưa sử dụng trong logic chính) |
| **Tác nhân** | Admin |
| **Điều kiện tiên quyết** | Đã đăng nhập với role "Quản lý" |
| **Input (thêm/sửa)** | - Tên danh mục (name)<br/>- Slug (slug) - độc nhất<br/>- Ảnh (image_url) |
| **Output** | - Danh sách danh mục<br/>- Thông báo thành công/lỗi |
| **Validation** | - name: không rỗng, <= 100 ký tự<br/>- slug: không rỗng, độc nhất, chỉ chứa a-z, 0-9, dấu "-"<br/>- image_url: URL hợp lệ |
| **Quy trình Xem** | 1. Admin click "Danh mục"<br/>2. API GET `/api/admin/categories`<br/>3. Hiển thị bảng danh mục |
| **Quy trình Thêm** | 1. Click "Thêm danh mục"<br/>2. Điền form + upload ảnh<br/>3. Validate<br/>4. POST `/api/admin/categories`<br/>5. Lưu vào DB |
| **Quy trình Sửa** | 1. Click "Sửa" trên danh mục<br/>2. Mở form<br/>3. Thay đổi<br/>4. PUT `/api/admin/categories/:id`<br/>5. Cập nhật DB |
| **Quy trình Xóa** | 1. Click "Xóa"<br/>2. Xác nhận<br/>3. DELETE `/api/admin/categories/:id` |
| **Xử lý ngoại lệ** | - Slug trùng: "Slug đã tồn tại"<br/>- URL ảnh không hợp lệ: "URL không hợp lệ" |
| **Dữ liệu liên quan** | categories |
| **API sử dụng** | GET/POST/PUT/DELETE `/api/admin/categories` |

---

## 4. CHỨC NĂNG: XÁC NHẬN ĐẶT SÂN NGÀY

| Yếu tố | Chi tiết |
|--------|---------|
| **Mã chức năng** | AD004 |
| **Tên chức năng** | Xác nhận Đặt sân Ngày |
| **Mô tả** | Xem danh sách booking sân ngày đang chờ xác nhận, xác nhận hoặc từ chối booking |
| **Tác nhân** | Admin, Nhân viên |
| **Điều kiện tiên quyết** | - Đã đăng nhập<br/>- Có booking pending |
| **Input** | - Mã booking (MaDatSan)<br/>- Trạng thái xác nhận (confirmed/rejected)<br/>- Ghi chú (tùy chọn) |
| **Output** | - Danh sách booking pending<br/>- Form xác nhận<br/>- Thông báo thành công |
| **Validation** | - MaDatSan: tồn tại<br/>- Trạng thái: "confirmed" hoặc "rejected"<br/>- Booking phải ở trạng thái "pending" |
| **Quy trình** | 1. Admin vào route `/xacnhansan`<br/>2. API GET `/api/admin/datsan`<br/>3. Lọc booking status="pending"<br/>4. Hiển thị modal/form<br/>5. Admin chọn confirmed/rejected<br/>6. PUT `/api/admin/datsan/:maDatSan`<br/>7. Cập nhật trạng thái<br/>8. Refresh danh sách |
| **Xử lý ngoại lệ** | - Booking không tồn tại: "Booking không tìm thấy"<br/>- Booking đã xác nhận: "Booking đã xác nhận" |
| **Dữ liệu liên quan** | tbl_datsan |
| **API sử dụng** | GET `/api/admin/datsan`<br/>PUT `/api/admin/datsan/:maDatSan` |

---

## 5. CHỨC NĂNG: KIỂM TRA SÂN HÔM NAY

| Yếu tố | Chi tiết |
|--------|---------|
| **Mã chức năng** | AD005 |
| **Tên chức năng** | Kiểm tra Sân Hôm nay |
| **Mô tả** | Xem các booking sân ngày được xác nhận trong ngày hôm nay |
| **Tác nhân** | Admin, Nhân viên |
| **Điều kiện tiên quyết** | Có booking xác nhận trong ngày |
| **Input** | Ngày hiện tại (tự động) |
| **Output** | Danh sách các booking confirmed của ngày hôm nay |
| **Validation** | Ngày >= ngày hiện tại |
| **Quy trình** | 1. Admin click `/checksanngay`<br/>2. API GET `/api/admin/datsan`<br/>3. Lọc booking:<br/>   - NgayLap = hôm nay<br/>   - TrangThai = "confirmed"<br/>4. Hiển thị danh sách |
| **Xử lý ngoại lệ** | - Không có booking: Hiển thị "Không có booking hôm nay" |
| **Dữ liệu liên quan** | tbl_datsan |
| **API sử dụng** | GET `/api/admin/datsan` |

---

## 6. CHỨC NĂNG: QUẢN LÝ TÀI KHOẢN

| Yếu tố | Chi tiết |
|--------|---------|
| **Mã chức năng** | AD006 |
| **Tên chức năng** | Quản lý Tài khoản |
| **Mô tả** | Xem, thêm, sửa, xóa tài khoản người dùng (Admin, Nhân viên, Khách hàng) |
| **Tác nhân** | Admin |
| **Điều kiện tiên quyết** | Đã đăng nhập với role "Quản lý" |
| **Input (thêm/sửa)** | - Username (userName) - độc nhất<br/>- Password (passWord) - mã hóa<br/>- Role (role): "Quản lý", "Nhân viên"<br/>- Tên người dùng (tùy loại) |
| **Output** | - Danh sách tài khoản<br/>- Thông báo thành công/lỗi |
| **Validation** | - Username: không rỗng, độc nhất, >= 3 ký tự<br/>- Password: >= 6 ký tự<br/>- Role: phải hợp lệ<br/>- Email (nếu có): định dạng email |
| **Quy trình Xem** | 1. Admin click "Quản lý tài khoản"<br/>2. API GET `/api/admin/taikhoan`<br/>3. Hiển thị danh sách |
| **Quy trình Thêm** | 1. Click "Thêm tài khoản"<br/>2. Điền form<br/>3. POST `/api/admin/taikhoan`<br/>4. Mã hóa password (bcrypt)<br/>5. Lưu vào DB |
| **Quy trình Sửa** | 1. Click "Sửa"<br/>2. Thay đổi thông tin<br/>3. PUT `/api/admin/taikhoan/:maTK`<br/>4. Cập nhật DB |
| **Quy trình Xóa** | 1. Click "Xóa"<br/>2. Xác nhận<br/>3. DELETE `/api/admin/taikhoan/:maTK` |
| **Xử lý ngoại lệ** | - Username trùng: "Tên đăng nhập đã tồn tại"<br/>- Password < 6 ký tự: "Mật khẩu >= 6 ký tự"<br/>- Không được xóa tài khoản có dữ liệu liên kết |
| **Dữ liệu liên quan** | tbl_taikhoan |
| **API sử dụng** | GET/POST/PUT/DELETE `/api/admin/taikhoan` |

---

## 7. CHỨC NĂNG: QUẢN LÝ SỰ KIỆN XÉ VÉ

| Yếu tố | Chi tiết |
|--------|---------|
| **Mã chức năng** | AD007 |
| **Tên chức năng** | Quản lý Xé vé Sự kiện |
| **Mô tả** | Tạo, sửa, xóa sự kiện Pickleball; Quản lý danh sách người tham gia |
| **Tác nhân** | Admin |
| **Điều kiện tiên quyết** | Đã đăng nhập với role "Quản lý" |
| **Input (thêm/sửa)** | - Tên sự kiện (TenSuKien)<br/>- Danh sách sân (DanhSachSan)<br/>- Thời gian bắt đầu (ThoiGianBatDau)<br/>- Thời gian kết thúc (ThoiGianKetThuc)<br/>- Ngày tổ chức (NgayToChuc)<br/>- Số lượng tối đa (SoLuongToiDa)<br/>- Trạng thái (TrangThai): "Mở" hoặc "Khóa" |
| **Output** | - Danh sách sự kiện<br/>- Danh sách người tham gia<br/>- Thông báo |
| **Validation** | - TenSuKien: không rỗng<br/>- NgayToChuc: >= hôm nay<br/>- ThoiGianBatDau < ThoiGianKetThuc<br/>- SoLuongToiDa: > 0<br/>- DanhSachSan: ít nhất 1 sân |
| **Quy trình Xem** | 1. Admin vào `/xeve`<br/>2. API GET `/api/admin/xeve/sukien`<br/>3. Hiển thị danh sách sự kiện |
| **Quy trình Thêm** | 1. Click "Tạo sự kiện"<br/>2. Điền thông tin<br/>3. POST `/api/admin/xeve/sukien`<br/>4. Lưu vào DB |
| **Quy trình Xem Chi tiết** | 1. Click sự kiện<br/>2. API GET `/api/admin/xeve/datve?MaXeVe=xxx`<br/>3. Hiển thị danh sách người tham gia |
| **Quy trình Đóng/Mở Sự kiện** | 1. Click "Đóng/Mở"<br/>2. PUT `/api/admin/xeve/sukien/:MaXeVe`<br/>3. Cập nhật TrangThai |
| **Xử lý ngoại lệ** | - Ngày tổ chức < hôm nay: "Ngày không hợp lệ"<br/>- Đã có người đăng ký không cho xóa<br/>- Thời gian không hợp lệ: "Thời gian kết thúc phải > thời gian bắt đầu" |
| **Dữ liệu liên quan** | tbl_xeve_sukien, tbl_xeve_datve |
| **API sử dụng** | GET/POST/PUT/DELETE `/api/admin/xeve/sukien`<br/>GET `/api/admin/xeve/datve` |

---

## BẢNG TỔNG HỢP API ENDPOINTS - ADMIN

| STT | Endpoint | Method | Mô tả | Input | Output |
|-----|----------|--------|-------|-------|--------|
| 1 | `/api/admin/san` | GET | Lấy danh sách sân | Không | Mảng sân |
| 2 | `/api/admin/san` | POST | Thêm sân | MaSan, TenSan, LoaiSan, GiaThueTruoc16, GiaThueSau16 | Sân mới |
| 3 | `/api/admin/san/:maSan` | PUT | Cập nhật sân | Các trường cần sửa | Sân đã cập nhật |
| 4 | `/api/admin/san/:maSan` | DELETE | Xóa sân | MaSan | Xác nhận xóa |
| 5 | `/api/admin/datsan` | GET | Lấy danh sách booking sân ngày | Không | Mảng booking |
| 6 | `/api/admin/datsan` | POST | Tạo booking sân ngày | Thông tin booking | Booking mới |
| 7 | `/api/admin/datsan/:maDatSan` | PUT | Cập nhật/xác nhận booking | MaDatSan, TrangThai | Booking đã cập nhật |
| 8 | `/api/admin/santhang/list` | GET | Lấy danh sách booking sân tháng | Không | Mảng booking tháng |
| 9 | `/api/admin/categories` | GET | Lấy danh sách danh mục | Không | Mảng danh mục |
| 10 | `/api/admin/categories` | POST | Thêm danh mục | name, slug, image_url | Danh mục mới |
| 11 | `/api/admin/categories/:id` | PUT | Cập nhật danh mục | Các trường cần sửa | Danh mục đã cập nhật |
| 12 | `/api/admin/categories/:id` | DELETE | Xóa danh mục | ID | Xác nhận xóa |
| 13 | `/api/admin/taikhoan` | GET | Lấy danh sách tài khoản | Không | Mảng tài khoản |
| 14 | `/api/admin/taikhoan` | POST | Thêm tài khoản | userName, passWord, role | Tài khoản mới |
| 15 | `/api/admin/taikhoan/:maTK` | PUT | Cập nhật tài khoản | Các trường cần sửa | Tài khoản đã cập nhật |
| 16 | `/api/admin/taikhoan/:maTK` | DELETE | Xóa tài khoản | maTK | Xác nhận xóa |
| 17 | `/api/admin/xeve/sukien` | GET | Lấy danh sách sự kiện | Không | Mảng sự kiện |
| 18 | `/api/admin/xeve/sukien` | POST | Tạo sự kiện | Thông tin sự kiện | Sự kiện mới |
| 19 | `/api/admin/xeve/sukien/:MaXeVe` | PUT | Cập nhật sự kiện | Các trường cần sửa | Sự kiện đã cập nhật |
| 20 | `/api/admin/xeve/sukien/:MaXeVe` | DELETE | Xóa sự kiện | MaXeVe | Xác nhận xóa |
| 21 | `/api/admin/xeve/datve` | GET | Lấy danh sách booking xé vé | MaXeVe | Mảng booking xé vé |

---

# PHÂN TÍCH CHI TIẾT DỮ LIỆU ĐẦU VÀO

## CHỨC NĂNG: ĐĂNG NHẬP ADMIN

### Dữ liệu yêu cầu

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| TENDANGNHAP | Tên đăng nhập của admin | Text Field (string) | ✅ Có |
| MATKHAU | Mật khẩu đăng nhập | Text Field (string) | ✅ Có |

### Kiểm tra dữ liệu (Validation Rules)

#### Trường: TENDANGNHAP
- **Type**: Text Field (string)
- **Max Length**: 20 ký tự
- **Min Length**: 3 ký tự
- **Format**: Chỉ chữ, số, không khoảng trắng
- **Required**: Bắt buộc nhập
- **Error Message**:
  - "Vui lòng nhập tên đăng nhập" (nếu rỗng)
  - "Tên đăng nhập từ 3-20 ký tự" (nếu quá ngắn/dài)
  - "Tên đăng nhập không được chứa khoảng trắng" (nếu có khoảng trắng)

#### Trường: MATKHAU
- **Type**: Text Field (string)
- **Max Length**: 50 ký tự
- **Min Length**: 6 ký tự
- **Format**: Có thể chứa chữ, số, ký tự đặc biệt
- **Required**: Bắt buộc nhập
- **Masked**: Hiển thị dấu * thay vì ký tự thật
- **Error Message**:
  - "Vui lòng nhập mật khẩu" (nếu rỗng)
  - "Mật khẩu phải từ 6-50 ký tự" (nếu quá ngắn/dài)

### Quy trình xác thực
```
1. Frontend validate (client-side)
   ↓
2. Gửi request POST `/api/admin/taikhoan/login`
   ↓
3. Backend validate (server-side)
   ↓
4. So sánh với DB
   - SELECT * FROM tbl_taikhoan WHERE userName = ? AND passWord = ?
   ↓
5. Nếu match:
   - Trả về response success
   - Lưu thông tin vào localStorage
   - Redirect tới /dashboard
   ↓
6. Nếu không match:
   - Trả về error message
   - Hiển thị alert "Sai tên đăng nhập hoặc mật khẩu"
```

---

## CHỨC NĂNG: QUẢN LÝ SÂN - THÊM SÂN

### Dữ liệu yêu cầu

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| MASAN | Mã sân (ví dụ: S1, S16) | Text Field (string) | ✅ Có |
| TENSAN | Tên sân (ví dụ: Sân 1, Sân TT) | Text Field (string) | ✅ Có |
| LOAISAN | Loại sân (Thường/VIP) | Select Dropdown | ✅ Có |
| GIATHUETUOC16 | Giá thuê trước 16h (VNĐ) | Number Input | ✅ Có |
| GIAHUECHUNG16 | Giá thuê sau 16h (VNĐ) | Number Input | ✅ Có |
| TRANGTHAI | Trạng thái sân | Select Dropdown | ✅ Có |

### Kiểm tra dữ liệu (Validation Rules)

#### Trường: MASAN
- **Type**: Text Field (string)
- **Max Length**: 5 ký tự
- **Pattern**: S[0-9]+ (ví dụ: S1, S16)
- **Unique**: Không được trùng với sân đã tồn tại
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng nhập mã sân" (nếu rỗng)
  - "Mã sân phải dạng S + số (ví dụ: S1, S16)" (nếu format sai)
  - "Mã sân đã tồn tại trong hệ thống" (nếu trùng)

#### Trường: TENSAN
- **Type**: Text Field (string)
- **Max Length**: 100 ký tự
- **Min Length**: 1 ký tự
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng nhập tên sân" (nếu rỗng)
  - "Tên sân không được quá 100 ký tự" (nếu quá dài)

#### Trường: LOAISAN
- **Type**: Select Dropdown
- **Options**: ["Thường", "VIP"]
- **Default**: "Thường"
- **Required**: Bắt buộc chọn
- **Error Message**:
  - "Vui lòng chọn loại sân" (nếu không chọn)

#### Trường: GIATHUETUOC16
- **Type**: Number Input (Currency)
- **Min Value**: 50000 (50k đồng)
- **Max Value**: 10000000 (10 triệu đồng)
- **Decimal**: Không cho phép
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng nhập giá thuê trước 16h" (nếu rỗng)
  - "Giá phải >= 50.000đ" (nếu < 50000)
  - "Giá không được > 10.000.000đ" (nếu > 10000000)
  - "Giá phải là số nguyên" (nếu có số thập phân)

#### Trường: GIAHUECHUNG16
- **Type**: Number Input (Currency)
- **Min Value**: 50000 (50k đồng)
- **Max Value**: 10000000 (10 triệu đồng)
- **Decimal**: Không cho phép
- **Required**: Bắt buộc
- **Validation Logic**: GIAHUECHUNG16 > GIATHUETUOC16
- **Error Message**:
  - "Vui lòng nhập giá thuê sau 16h" (nếu rỗng)
  - "Giá phải >= 50.000đ" (nếu < 50000)
  - "Giá không được > 10.000.000đ" (nếu > 10000000)
  - "Giá sau 16h phải > giá trước 16h" (nếu <= GIATHUETUOC16)

#### Trường: TRANGTHAI
- **Type**: Select Dropdown
- **Options**: ["Hoạt động", "Đóng cửa"]
- **Default**: "Hoạt động"
- **Required**: Bắt buộc chọn
- **Error Message**:
  - "Vui lòng chọn trạng thái sân" (nếu không chọn)

### Quy trình xử lý
```
1. Frontend validate (client-side)
   ├─ Check bắt buộc
   ├─ Check format
   └─ Check giá trị
   ↓
2. Hiển thị error nếu có lỗi
   ↓
3. Nếu hợp lệ, gửi POST `/api/admin/san`
   ↓
4. Backend validate (server-side)
   ├─ Check bắt buộc
   ├─ Check unique MASAN
   └─ Check constraints
   ↓
5. Nếu hợp lệ:
   - INSERT vào tbl_san
   - Trả về success
   - Refresh danh sách
   ↓
6. Nếu lỗi:
   - Trả về error message
   - Hiển thị alert
```

---

## CHỨC NĂNG: QUẢN LÝ SÂN - SỬA SÂN

### Dữ liệu yêu cầu

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| MASAN | Mã sân (readonly - không được sửa) | Text Field (disabled) | ✅ Có |
| TENSAN | Tên sân | Text Field (string) | ✅ Có |
| LOAISAN | Loại sân (Thường/VIP) | Select Dropdown | ✅ Có |
| GIATHUETUOC16 | Giá thuê trước 16h (VNĐ) | Number Input | ✅ Có |
| GIAHUECHUNG16 | Giá thuê sau 16h (VNĐ) | Number Input | ✅ Có |
| TRANGTHAI | Trạng thái sân | Select Dropdown | ✅ Có |

### Kiểm tra dữ liệu (Validation Rules)
- **Giống như THÊM SÂN nhưng:**
  - MASAN: readonly (không được sửa)
  - Không kiểm tra unique cho MASAN (vì là update)
  - Kiểm tra xem sân có booking không:
    - Nếu có booking confirmed: Cảnh báo nhưng vẫn cho phép sửa giá
    - Nếu muốn xóa sân có booking: Không cho phép

---

## CHỨC NĂNG: QUẢN LÝ SÂN - XÓA SÂN

### Dữ liệu yêu cầu

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| MASAN | Mã sân cần xóa | Text (để xác nhận) | ✅ Có |

### Kiểm tra dữ liệu (Validation Rules)

#### Trước khi xóa:
- **Check 1**: Sân có booking pending?
  - Nếu có → "Không được xóa sân có booking chờ xác nhận"
  
- **Check 2**: Sân có booking confirmed?
  - Nếu có → "Không được xóa sân có booking đã xác nhận"
  
- **Check 3**: Sân có booking sân tháng?
  - Nếu có → "Không được xóa sân có hợp đồng sân tháng"
  
- **Check 4**: Sân có booking sự kiện xé vé?
  - Nếu có → "Không được xóa sân có sự kiện xé vé"

#### Nếu hợp lệ:
- Hiển thị modal xác nhận: "Bạn có chắc chắn xóa sân [TENSAN] không?"
- Yêu cầu admin nhập MASAN để xác nhận
- Nếu nhập đúng → DELETE vào DB
- Nếu nhập sai → "Mã sân không khớp"

---

## CHỨC NĂNG: QUẢN LÝ DANH MỤC - THÊM DANH MỤC

### Dữ liệu yêu cầu

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| NAME | Tên danh mục | Text Field (string) | ✅ Có |
| SLUG | URL slug (tự động hoặc nhập thủ công) | Text Field (string) | ✅ Có |
| IMAGE_URL | URL ảnh danh mục | Text Field (URL) + File Upload | ✅ Có |

### Kiểm tra dữ liệu (Validation Rules)

#### Trường: NAME
- **Type**: Text Field
- **Max Length**: 100 ký tự
- **Min Length**: 1 ký tự
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng nhập tên danh mục" (nếu rỗng)
  - "Tên danh mục không được quá 100 ký tự"

#### Trường: SLUG
- **Type**: Text Field
- **Max Length**: 100 ký tự
- **Pattern**: ^[a-z0-9]+(?:-[a-z0-9]+)*$ (lowercase, số, dấu -)
- **Unique**: Không được trùng
- **Auto-generate**: Có thể tự động sinh từ NAME
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng nhập slug" (nếu rỗng)
  - "Slug chỉ chứa chữ thường, số, và dấu - (ví dụ: my-category)"
  - "Slug đã tồn tại" (nếu trùng)

#### Trường: IMAGE_URL
- **Type**: File Upload + Text Field
- **Accepted Format**: .jpg, .jpeg, .png, .gif, .webp
- **Max Size**: 5MB
- **Required**: Bắt buộc
- **Upload to**: /uploads/categories/
- **Error Message**:
  - "Vui lòng chọn ảnh" (nếu không chọn)
  - "Định dạng file không hỗ trợ (chỉ jpg, png, gif, webp)"
  - "Kích thước ảnh không được > 5MB"
  - "Upload ảnh thất bại"

### Quy trình xử lý
```
1. Frontend validate
2. Upload ảnh (nếu có)
3. Tự động sinh SLUG từ NAME (nếu trống)
4. POST `/api/admin/categories`
5. Backend:
   - Validate dữ liệu
   - Check unique SLUG
   - Save ảnh
   - INSERT vào DB
6. Trả về response
7. Refresh danh sách
```

---

## CHỨC NĂNG: QUẢN LÝ TÀI KHOẢN - THÊM TÀI KHOẢN

### Dữ liệu yêu cầu

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| USERNAME | Tên đăng nhập | Text Field (string) | ✅ Có |
| PASSWORD | Mật khẩu | Text Field (password) | ✅ Có |
| CONFIRMPASSWORD | Xác nhận mật khẩu | Text Field (password) | ✅ Có |
| ROLE | Vai trò người dùng | Select Dropdown | ✅ Có |

### Kiểm tra dữ liệu (Validation Rules)

#### Trường: USERNAME
- **Type**: Text Field (string)
- **Max Length**: 20 ký tự
- **Min Length**: 3 ký tự
- **Pattern**: Chỉ chữ, số, không khoảng trắng, không ký tự đặc biệt
- **Unique**: Không được trùng với tài khoản đã tồn tại
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng nhập tên đăng nhập" (nếu rỗng)
  - "Tên đăng nhập từ 3-20 ký tự" (nếu quá ngắn/dài)
  - "Tên đăng nhập chỉ chứa chữ, số, không khoảng trắng" (nếu format sai)
  - "Tên đăng nhập đã tồn tại" (nếu trùng)

#### Trường: PASSWORD
- **Type**: Text Field (password)
- **Max Length**: 50 ký tự
- **Min Length**: 6 ký tự
- **Format**: Có thể chứa chữ, số, ký tự đặc biệt (!@#$%^&*)
- **Required**: Bắt buộc
- **Masked**: Hiển thị dấu * thay vì ký tự thật
- **Strength Indicator**: Hiển thị mức độ mật khẩu (Yếu/Trung bình/Mạnh)
  - Yếu: Chỉ chứa chữ hoặc số
  - Trung bình: Chứa chữ + số hoặc chữ + ký tự đặc biệt
  - Mạnh: Chứa chữ + số + ký tự đặc biệt
- **Error Message**:
  - "Vui lòng nhập mật khẩu" (nếu rỗng)
  - "Mật khẩu phải từ 6-50 ký tự" (nếu quá ngắn/dài)

#### Trường: CONFIRMPASSWORD
- **Type**: Text Field (password)
- **Max Length**: 50 ký tự
- **Min Length**: 6 ký tự
- **Required**: Bắt buộc
- **Validation Logic**: CONFIRMPASSWORD = PASSWORD
- **Masked**: Hiển thị dấu * thay vì ký tự thật
- **Error Message**:
  - "Vui lòng nhập xác nhận mật khẩu" (nếu rỗng)
  - "Mật khẩu xác nhận không khớp" (nếu khác PASSWORD)

#### Trường: ROLE
- **Type**: Select Dropdown
- **Options**: ["Quản lý", "Nhân viên"]
- **Default**: "Nhân viên"
- **Required**: Bắt buộc chọn
- **Error Message**:
  - "Vui lòng chọn vai trò" (nếu không chọn)

### Quy trình xử lý
```
1. Frontend validate (client-side)
   ├─ Check bắt buộc
   ├─ Check format USERNAME
   ├─ Check độ dài PASSWORD
   └─ Check PASSWORD = CONFIRMPASSWORD
   ↓
2. Hiển thị error nếu có lỗi
   ↓
3. Nếu hợp lệ, gửi POST `/api/admin/taikhoan`
   ↓
4. Backend validate (server-side)
   ├─ Check bắt buộc
   ├─ Check unique USERNAME
   └─ Check constraints
   ↓
5. Nếu hợp lệ:
   - Mã hóa password (bcrypt)
   - INSERT vào tbl_taikhoan
   - Trả về success
   - Refresh danh sách
   ↓
6. Nếu lỗi:
   - Trả về error message
   - Hiển thị alert
```

---

## CHỨC NĂNG: QUẢN LÝ TÀI KHOẢN - SỬA TÀI KHOẢN

### Dữ liệu yêu cầu

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| USERNAME | Tên đăng nhập (readonly) | Text Field (disabled) | ✅ Có |
| PASSWORD | Mật khẩu mới (để trống nếu không đổi) | Text Field (password) | ❌ Không |
| CONFIRMPASSWORD | Xác nhận mật khẩu | Text Field (password) | ❌ Không |
| ROLE | Vai trò người dùng | Select Dropdown | ✅ Có |

### Kiểm tra dữ liệu (Validation Rules)

#### Trường: USERNAME
- **Type**: Text Field (readonly/disabled)
- **Ghi chú**: Không được phép sửa, hiển thị thông tin hiện tại

#### Trường: PASSWORD
- **Type**: Text Field (password)
- **Max Length**: 50 ký tự
- **Min Length**: 6 ký tự (nếu nhập)
- **Required**: Không bắt buộc
- **Ghi chú**: Để trống nếu không muốn đổi mật khẩu
- **Error Message**:
  - "Mật khẩu phải từ 6-50 ký tự" (nếu nhập nhưng quá ngắn/dài)
  - "Vui lòng nhập xác nhận mật khẩu nếu thay đổi mật khẩu" (nếu nhập PASSWORD nhưng CONFIRMPASSWORD rỗng)

#### Trường: CONFIRMPASSWORD
- **Type**: Text Field (password)
- **Required**: Không bắt buộc
- **Validation Logic**: CONFIRMPASSWORD = PASSWORD (nếu cả hai được nhập)
- **Error Message**:
  - "Mật khẩu xác nhận không khớp" (nếu khác PASSWORD)

#### Trường: ROLE
- **Type**: Select Dropdown
- **Options**: ["Quản lý", "Nhân viên"]
- **Required**: Bắt buộc chọn
- **Error Message**:
  - "Vui lòng chọn vai trò" (nếu không chọn)

### Quy trình xử lý
```
1. Load dữ liệu tài khoản hiện tại
2. Hiển thị form với USERNAME disabled
3. Frontend validate
   ├─ Nếu PASSWORD không rỗng:
   │  ├─ Check độ dài
   │  └─ Check PASSWORD = CONFIRMPASSWORD
   └─ Check ROLE
4. Nếu hợp lệ, gửi PUT `/api/admin/taikhoan/:maTK`
5. Backend:
   - Nếu PASSWORD được gửi:
     - Mã hóa password mới
     - Cập nhật password
   - Cập nhật ROLE (nếu thay đổi)
   - UPDATE tbl_taikhoan
6. Trả về response
7. Refresh danh sách
```

---

## CHỨC NĂNG: QUẢN LÝ SỰ KIỆN XÉ VÉ - TẠO SỰ KIỆN

### Dữ liệu yêu cầu

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| TENSUKIEN | Tên sự kiện | Text Field (string) | ✅ Có |
| NGAYTOCHUC | Ngày tổ chức | Date Picker | ✅ Có |
| GIOBACDAU | Giờ bắt đầu | Time Picker | ✅ Có |
| GIOKETTHUC | Giờ kết thúc | Time Picker | ✅ Có |
| DANHSACHSAN | Danh sách sân | Multi-Select Checkbox | ✅ Có |
| SOLUONGTOIDA | Số lượng tối đa | Number Input | ✅ Có |
| MOTA | Mô tả sự kiện | Text Area | ❌ Không |
| TRANGTHAI | Trạng thái | Select Dropdown | ✅ Có |

### Kiểm tra dữ liệu (Validation Rules)

#### Trường: TENSUKIEN
- **Type**: Text Field (string)
- **Max Length**: 200 ký tự
- **Min Length**: 1 ký tự
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng nhập tên sự kiện" (nếu rỗng)
  - "Tên sự kiện không được quá 200 ký tự" (nếu quá dài)

#### Trường: NGAYTOCHUC
- **Type**: Date Picker
- **Format**: DD/MM/YYYY
- **Min Date**: Hôm nay (không được chọn ngày quá khứ)
- **Max Date**: Không giới hạn
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng chọn ngày tổ chức" (nếu rỗng)
  - "Ngày tổ chức phải >= ngày hôm nay" (nếu < hôm nay)

#### Trường: GIOBACDAU
- **Type**: Time Picker
- **Format**: HH:mm (24-hour format)
- **Min Value**: 06:00
- **Max Value**: 22:00
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng chọn giờ bắt đầu" (nếu rỗng)
  - "Giờ bắt đầu phải trong khoảng 06:00 - 22:00" (nếu ngoài giờ)

#### Trường: GIOKETTHUC
- **Type**: Time Picker
- **Format**: HH:mm (24-hour format)
- **Min Value**: 06:00
- **Max Value**: 23:00
- **Validation Logic**: GIOKETTHUC > GIOBACDAU
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng chọn giờ kết thúc" (nếu rỗng)
  - "Giờ kết thúc phải > giờ bắt đầu" (nếu <= GIOBACDAU)
  - "Giờ kết thúc phải trong khoảng 06:00 - 23:00" (nếu ngoài giờ)

#### Trường: DANHSACHSAN
- **Type**: Multi-Select Checkbox
- **Options**: Lấy từ tbl_san (danh sách sân hoạt động)
- **Min Selection**: 1 sân
- **Max Selection**: Không giới hạn
- **Required**: Bắt buộc chọn ít nhất 1 sân
- **Error Message**:
  - "Vui lòng chọn ít nhất 1 sân" (nếu không chọn)

#### Trường: SOLUONGTOIDA
- **Type**: Number Input (Integer)
- **Min Value**: 1 (1 người)
- **Max Value**: 1000 (1000 người)
- **Decimal**: Không cho phép
- **Required**: Bắt buộc
- **Error Message**:
  - "Vui lòng nhập số lượng tối đa" (nếu rỗng)
  - "Số lượng phải >= 1" (nếu < 1)
  - "Số lượng không được > 1000" (nếu > 1000)
  - "Số lượng phải là số nguyên" (nếu có số thập phân)

#### Trường: MOTA
- **Type**: Text Area
- **Max Length**: 1000 ký tự
- **Min Length**: 0 ký tự
- **Required**: Không bắt buộc
- **Rows**: 5
- **Error Message**:
  - "Mô tả không được quá 1000 ký tự" (nếu quá dài)

#### Trường: TRANGTHAI
- **Type**: Select Dropdown
- **Options**: ["Mở", "Khóa"]
- **Default**: "Mở"
- **Required**: Bắt buộc chọn
- **Error Message**:
  - "Vui lòng chọn trạng thái" (nếu không chọn)

### Quy trình xử lý
```
1. Frontend validate (client-side)
   ├─ Check bắt buộc
   ├─ Check format ngày/giờ
   ├─ Check GIOKETTHUC > GIOBACDAU
   ├─ Check ít nhất 1 sân được chọn
   └─ Check SOLUONGTOIDA >= 1
   ↓
2. Hiển thị error nếu có lỗi
   ↓
3. Nếu hợp lệ, gửi POST `/api/admin/xeve/sukien`
   ↓
4. Backend validate (server-side)
   ├─ Check bắt buộc
   ├─ Verify sân có tồn tại
   └─ Check constraints
   ↓
5. Nếu hợp lệ:
   - INSERT vào tbl_xeve_sukien
   - Tạo các record liên kết với sân
   - Trả về success
   - Refresh danh sách
   ↓
6. Nếu lỗi:
   - Trả về error message
   - Hiển thị alert
```

---

## CHỨC NĂNG: XÁC NHẬN ĐẶT SÂN NGÀY

### Dữ liệu yêu cầu (khi xác nhận)

| Trường | Mô tả | Kiểu dữ liệu | Bắt buộc |
|--------|-------|-------------|---------|
| MADATSAN | Mã booking | Text (readonly) | ✅ Có |
| TRANGTHAI | Trạng thái xác nhận | Select Dropdown | ✅ Có |
| GHICHU | Ghi chú từ chối (nếu reject) | Text Area | ❌ Có (khi reject) |

### Kiểm tra dữ liệu (Validation Rules)

#### Trường: MADATSAN
- **Type**: Text (readonly/display only)
- **Ghi chú**: Hiển thị thông tin booking (sân, ngày, giờ, khách hàng)

#### Trường: TRANGTHAI
- **Type**: Select Dropdown
- **Options**: ["Xác nhận", "Từ chối"]
- **Required**: Bắt buộc chọn
- **Error Message**:
  - "Vui lòng chọn hành động" (nếu không chọn)

#### Trường: GHICHU (khi chọn "Từ chối")
- **Type**: Text Area
- **Max Length**: 500 ký tự
- **Min Length**: 1 ký tự
- **Required**: Bắt buộc khi chọn "Từ chối"
- **Rows**: 3
- **Placeholder**: "Lý do từ chối (vui lòng ghi rõ lý do)..."
- **Error Message**:
  - "Vui lòng nhập lý do từ chối" (nếu chọn Từ chối nhưng rỗng)
  - "Lý do từ chối không được quá 500 ký tự" (nếu quá dài)

### Quy trình xử lý

#### Khi Xác nhận:
```
1. Admin click nút "Xác nhận" trên booking
2. Hiển thị dialog/modal xác nhận
3. Admin chọn "Xác nhận"
4. PUT `/api/admin/datsan/:maDatSan`
   Body: { TrangThai: "Xác nhận" }
5. Backend:
   - Validate MADATSAN tồn tại
   - Check TrangThai = "pending"
   - UPDATE tbl_datsan SET TrangThai = "Xác nhận"
   - (Optional) Gửi email/SMS thông báo khách hàng
6. Refresh danh sách
7. Hiển thị toast success
```

#### Khi Từ chối:
```
1. Admin click nút "Từ chối" trên booking
2. Hiển thị dialog/modal với TextArea ghi chú
3. Admin nhập lý do từ chối
4. Frontend validate GHICHU không rỗng
5. PUT `/api/admin/datsan/:maDatSan`
   Body: { TrangThai: "Từ chối", GhiChu: "..." }
6. Backend:
   - Validate MADATSAN tồn tại
   - Check TrangThai = "pending"
   - UPDATE tbl_datsan SET TrangThai = "Từ chối", GhiChu = "..."
   - (Optional) Gửi email/SMS thông báo khách hàng về lý do từ chối
7. Refresh danh sách
8. Hiển thị toast success
```

### Dữ liệu hiển thị trong danh sách pending

Mỗi booking pending phải hiển thị:
- **Mã booking**: MaDatSan
- **Khách hàng**: Tên khách hàng
- **Sân**: Mã sân, Tên sân
- **Ngày**: NgayLap (định dạng DD/MM/YYYY)
- **Giờ**: GioLap - GioKetThuc
- **Giá**: GiaThueSan (định dạng tiền tệ)
- **Trạng thái hiện tại**: "Chờ xác nhận"
- **Nút hành động**: [Xác nhận] [Từ chối]

---

## CHỨC NĂNG: KIỂM TRA SÂN HÔM NAY

### Dữ liệu yêu cầu (Chỉ đọc - Read-only)

| Trường | Mô tả | Kiểu dữ liệu |
|--------|-------|-------------|
| NGAYHOMAY | Ngày hôm nay | Text (display) |
| DANHSACHBOOKING | Danh sách booking hôm nay | Table (readonly) |

### Kiểm tra dữ liệu (Validation Rules)

#### Lọc dữ liệu:
- **Ngày**: NgayLap = Ngày hôm nay (tính từ 00:00 - 23:59)
- **Trạng thái**: TrangThai = "Xác nhận"
- **Sắp xếp**: Theo GioLap tăng dần (từ sớm đến muộn)

### Dữ liệu hiển thị

Mỗi booking phải hiển thị:
- **STT**: Số thứ tự
- **Mã booking**: MaDatSan
- **Khách hàng**: Tên khách hàng + SĐT
- **Sân**: Mã sân + Tên sân
- **Thời gian**: Giờ bắt đầu - Giờ kết thúc (ví dụ: 08:00 - 09:00)
- **Loại sân**: Thường/VIP
- **Giá**: GiaThueSan (định dạng tiền tệ VNĐ)
- **Trạng thái**: "Xác nhận" (badge xanh)
- **Hành động**: [Chi tiết] [In phiếu]

### Quy trình xử lý
```
1. Admin click menu "Kiểm tra sân hôm nay"
2. Get current date (hôm nay)
3. API GET `/api/admin/datsan`
4. Filter dữ liệu:
   - NgayLap = hôm nay
   - TrangThai = "Xác nhận"
5. Sort theo GioLap ASC
6. Hiển thị danh sách
7. Nếu không có booking:
   - Hiển thị message: "Không có booking nào được xác nhận cho hôm nay"
```

### Chức năng bổ sung

**Tìm kiếm/Lọc:**
- Tìm kiếm theo tên khách hàng
- Tìm kiếm theo mã sân
- Lọc theo loại sân (Thường/VIP)

**Export:**
- Xuất danh sách dưới dạng PDF
- Xuất danh sách dưới dạng Excel

**In phiếu:**
- In phiếu sử dụng sân chi tiết (tên khách, sân, giờ, ...)

---

# TỔNG HỢP DỮ LIỆU YÊU CẦU CỦA TẤT CẢ CHỨC NĂNG

## Bảng Chi tiết Input Fields - Toàn bộ chức năng

| STT | Chức năng | Trường | Type | Min Length | Max Length | Required | Mô tả |
|-----|-----------|--------|------|-----------|-----------|---------|-------|
| 1 | AD001 (Dashboard) | - | - | - | - | - | Không có input (Read-only) |
| 2 | AD002 (Quản lý Sân - Thêm) | MASAN | Text Field (string) | - | 5 | ✅ | Mã sân (S1, S16) |
| 3 | AD002 (Quản lý Sân - Thêm) | TENSAN | Text Field (string) | 1 | 100 | ✅ | Tên sân |
| 4 | AD002 (Quản lý Sân - Thêm) | LOAISAN | Select Dropdown | - | - | ✅ | Loại sân (Thường/VIP) |
| 5 | AD002 (Quản lý Sân - Thêm) | GIATHUETUOC16 | Number Input (Currency) | - | 10000000 | ✅ | Giá thuê trước 16h (VNĐ) |
| 6 | AD002 (Quản lý Sân - Thêm) | GIAHUECHUNG16 | Number Input (Currency) | - | 10000000 | ✅ | Giá thuê sau 16h (VNĐ) |
| 7 | AD002 (Quản lý Sân - Thêm) | TRANGTHAI | Select Dropdown | - | - | ✅ | Trạng thái (Hoạt động/Đóng cửa) |
| 8 | AD002 (Quản lý Sân - Sửa) | MASAN | Text Field (disabled) | - | 5 | ✅ | Mã sân (readonly) |
| 9 | AD002 (Quản lý Sân - Sửa) | TENSAN | Text Field (string) | 1 | 100 | ✅ | Tên sân |
| 10 | AD002 (Quản lý Sân - Sửa) | LOAISAN | Select Dropdown | - | - | ✅ | Loại sân (Thường/VIP) |
| 11 | AD002 (Quản lý Sân - Sửa) | GIATHUETUOC16 | Number Input (Currency) | - | 10000000 | ✅ | Giá thuê trước 16h (VNĐ) |
| 12 | AD002 (Quản lý Sân - Sửa) | GIAHUECHUNG16 | Number Input (Currency) | - | 10000000 | ✅ | Giá thuê sau 16h (VNĐ) |
| 13 | AD002 (Quản lý Sân - Sửa) | TRANGTHAI | Select Dropdown | - | - | ✅ | Trạng thái (Hoạt động/Đóng cửa) |
| 14 | AD002 (Quản lý Sân - Xóa) | MASAN | Text Field (string) | - | 5 | ✅ | Mã sân để xác nhận |
| 15 | AD003 (Quản lý Danh mục - Thêm) | NAME | Text Field (string) | 1 | 100 | ✅ | Tên danh mục |
| 16 | AD003 (Quản lý Danh mục - Thêm) | SLUG | Text Field (string) | - | 100 | ✅ | URL slug (auto-generate) |
| 17 | AD003 (Quản lý Danh mục - Thêm) | IMAGE_URL | File Upload | - | 5MB | ✅ | Ảnh danh mục (.jpg, .png, .gif, .webp) |
| 18 | AD003 (Quản lý Danh mục - Sửa) | NAME | Text Field (string) | 1 | 100 | ✅ | Tên danh mục |
| 19 | AD003 (Quản lý Danh mục - Sửa) | SLUG | Text Field (string) | - | 100 | ✅ | URL slug |
| 20 | AD003 (Quản lý Danh mục - Sửa) | IMAGE_URL | File Upload | - | 5MB | ❌ | Ảnh danh mục (optional) |
| 21 | AD004 (Xác nhận Đặt sân) | MADATSAN | Text Field (readonly) | - | - | ✅ | Mã booking (display only) |
| 22 | AD004 (Xác nhận Đặt sân) | TRANGTHAI | Select Dropdown | - | - | ✅ | Trạng thái (Xác nhận/Từ chối) |
| 23 | AD004 (Xác nhận Đặt sân) | GHICHU | Text Area | 1 | 500 | ❌ Có* | Ghi chú từ chối (bắt buộc khi từ chối) |
| 24 | AD005 (Kiểm tra sân hôm nay) | NGAYHOMAY | Text (display) | - | - | - | Ngày hôm nay (readonly) |
| 25 | AD005 (Kiểm tra sân hôm nay) | DANHSACHBOOKING | Table (readonly) | - | - | - | Danh sách booking hôm nay (readonly) |
| 26 | AD006 (Quản lý Tài khoản - Thêm) | USERNAME | Text Field (string) | 3 | 20 | ✅ | Tên đăng nhập |
| 27 | AD006 (Quản lý Tài khoản - Thêm) | PASSWORD | Text Field (password) | 6 | 50 | ✅ | Mật khẩu |
| 28 | AD006 (Quản lý Tài khoản - Thêm) | CONFIRMPASSWORD | Text Field (password) | 6 | 50 | ✅ | Xác nhận mật khẩu |
| 29 | AD006 (Quản lý Tài khoản - Thêm) | ROLE | Select Dropdown | - | - | ✅ | Vai trò (Quản lý/Nhân viên) |
| 30 | AD006 (Quản lý Tài khoản - Sửa) | USERNAME | Text Field (disabled) | 3 | 20 | ✅ | Tên đăng nhập (readonly) |
| 31 | AD006 (Quản lý Tài khoản - Sửa) | PASSWORD | Text Field (password) | 6 | 50 | ❌ | Mật khẩu mới (optional) |
| 32 | AD006 (Quản lý Tài khoản - Sửa) | CONFIRMPASSWORD | Text Field (password) | 6 | 50 | ❌ | Xác nhận mật khẩu (optional) |
| 33 | AD006 (Quản lý Tài khoản - Sửa) | ROLE | Select Dropdown | - | - | ✅ | Vai trò (Quản lý/Nhân viên) |
| 34 | AD006 (Quản lý Tài khoản - Login) | TENDANGNHAP | Text Field (string) | 3 | 20 | ✅ | Tên đăng nhập |
| 35 | AD006 (Quản lý Tài khoản - Login) | MATKHAU | Text Field (password) | 6 | 50 | ✅ | Mật khẩu |
| 36 | AD007 (Quản lý Xé vé - Tạo sự kiện) | TENSUKIEN | Text Field (string) | 1 | 200 | ✅ | Tên sự kiện |
| 37 | AD007 (Quản lý Xé vé - Tạo sự kiện) | NGAYTOCHUC | Date Picker | - | - | ✅ | Ngày tổ chức (DD/MM/YYYY) |
| 38 | AD007 (Quản lý Xé vé - Tạo sự kiện) | GIOBACDAU | Time Picker | - | - | ✅ | Giờ bắt đầu (HH:mm) |
| 39 | AD007 (Quản lý Xé vé - Tạo sự kiện) | GIOKETTHUC | Time Picker | - | - | ✅ | Giờ kết thúc (HH:mm) |
| 40 | AD007 (Quản lý Xé vé - Tạo sự kiện) | DANHSACHSAN | Multi-Select Checkbox | - | - | ✅ | Danh sách sân (min 1) |
| 41 | AD007 (Quản lý Xé vé - Tạo sự kiện) | SOLUONGTOIDA | Number Input (Integer) | 1 | 1000 | ✅ | Số lượng tối đa |
| 42 | AD007 (Quản lý Xé vé - Tạo sự kiện) | MOTA | Text Area | 0 | 1000 | ❌ | Mô tả sự kiện |
| 43 | AD007 (Quản lý Xé vé - Tạo sự kiện) | TRANGTHAI | Select Dropdown | - | - | ✅ | Trạng thái (Mở/Khóa) |
| 44 | AD007 (Quản lý Xé vé - Sửa sự kiện) | TENSUKIEN | Text Field (string) | 1 | 200 | ✅ | Tên sự kiện |
| 45 | AD007 (Quản lý Xé vé - Sửa sự kiện) | NGAYTOCHUC | Date Picker | - | - | ✅ | Ngày tổ chức (DD/MM/YYYY) |
| 46 | AD007 (Quản lý Xé vé - Sửa sự kiện) | GIOBACDAU | Time Picker | - | - | ✅ | Giờ bắt đầu (HH:mm) |
| 47 | AD007 (Quản lý Xé vé - Sửa sự kiện) | GIOKETTHUC | Time Picker | - | - | ✅ | Giờ kết thúc (HH:mm) |
| 48 | AD007 (Quản lý Xé vé - Sửa sự kiện) | DANHSACHSAN | Multi-Select Checkbox | - | - | ✅ | Danh sách sân (min 1) |
| 49 | AD007 (Quản lý Xé vé - Sửa sự kiện) | SOLUONGTOIDA | Number Input (Integer) | 1 | 1000 | ✅ | Số lượng tối đa |
| 50 | AD007 (Quản lý Xé vé - Sửa sự kiện) | MOTA | Text Area | 0 | 1000 | ❌ | Mô tả sự kiện |
| 51 | AD007 (Quản lý Xé vé - Sửa sự kiện) | TRANGTHAI | Select Dropdown | - | - | ✅ | Trạng thái (Mở/Khóa) |

---

## Tóm tắt Type của Dữ liệu

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| Text Field (string) | Nhập văn bản | Tên sân, Tên danh mục |
| Text Field (password) | Nhập mật khẩu (masked) | Mật khẩu, Xác nhận mật khẩu |
| Text Field (disabled/readonly) | Không cho sửa | Mã sân khi sửa, Username khi sửa |
| Number Input (Currency) | Nhập số tiền (VNĐ) | Giá thuê trước 16h, sau 16h |
| Number Input (Integer) | Nhập số nguyên | Số lượng tối đa |
| Select Dropdown | Chọn từ danh sách | Loại sân, Vai trò, Trạng thái |
| Multi-Select Checkbox | Chọn nhiều mục | Danh sách sân |
| Date Picker | Chọn ngày | Ngày tổ chức sự kiện |
| Time Picker | Chọn giờ | Giờ bắt đầu, kết thúc |
| File Upload | Upload file | Ảnh danh mục |
| Text Area | Nhập văn bản dài | Mô tả sự kiện, Ghi chú từ chối |
| Table (readonly) | Bảng hiển thị (không sửa) | Danh sách booking hôm nay |
| Text (readonly) | Hiển thị văn bản (không sửa) | Ngày hôm nay |

---

## Phân loại theo Loại Input

### A. Text Input Fields

| Trường | Chức năng | Min | Max | Required |
|--------|-----------|-----|-----|---------|
| TENDANGNHAP | AD006 (Login) | 3 | 20 | ✅ |
| MASAN | AD002 (Thêm/Sửa/Xóa) | - | 5 | ✅ |
| TENSAN | AD002 (Thêm/Sửa) | 1 | 100 | ✅ |
| NAME | AD003 (Thêm/Sửa) | 1 | 100 | ✅ |
| SLUG | AD003 (Thêm/Sửa) | - | 100 | ✅ |
| TENSUKIEN | AD007 (Tạo/Sửa) | 1 | 200 | ✅ |
| USERNAME | AD006 (Thêm/Login/Sửa) | 3 | 20 | ✅ |

### B. Password Fields

| Trường | Chức năng | Min | Max | Required |
|--------|-----------|-----|-----|---------|
| MATKHAU | AD006 (Login) | 6 | 50 | ✅ |
| PASSWORD | AD006 (Thêm Tài khoản) | 6 | 50 | ✅ |
| CONFIRMPASSWORD | AD006 (Thêm Tài khoản) | 6 | 50 | ✅ |
| PASSWORD | AD006 (Sửa Tài khoản) | 6 | 50 | ❌ |
| CONFIRMPASSWORD | AD006 (Sửa Tài khoản) | 6 | 50 | ❌ |

### C. Number/Currency Fields

| Trường | Chức năng | Min | Max | Type | Required |
|--------|-----------|-----|-----|------|---------|
| GIATHUETUOC16 | AD002 (Thêm/Sửa) | 50000 | 10000000 | Currency | ✅ |
| GIAHUECHUNG16 | AD002 (Thêm/Sửa) | 50000 | 10000000 | Currency | ✅ |
| SOLUONGTOIDA | AD007 (Tạo/Sửa) | 1 | 1000 | Integer | ✅ |

### D. Dropdown/Select Fields

| Trường | Chức năng | Options | Required |
|--------|-----------|---------|---------|
| LOAISAN | AD002 (Thêm/Sửa) | Thường, VIP | ✅ |
| TRANGTHAI (Sân) | AD002 (Thêm/Sửa) | Hoạt động, Đóng cửa | ✅ |
| TRANGTHAI (Xác nhận) | AD004 | Xác nhận, Từ chối | ✅ |
| TRANGTHAI (Sự kiện) | AD007 (Tạo/Sửa) | Mở, Khóa | ✅ |
| ROLE | AD006 (Thêm/Sửa) | Quản lý, Nhân viên | ✅ |

### E. Date/Time Fields

| Trường | Chức năng | Format | Required |
|--------|-----------|--------|---------|
| NGAYTOCHUC | AD007 (Tạo/Sửa) | DD/MM/YYYY | ✅ |
| GIOBACDAU | AD007 (Tạo/Sửa) | HH:mm (06:00-22:00) | ✅ |
| GIOKETTHUC | AD007 (Tạo/Sửa) | HH:mm (06:00-23:00) | ✅ |

### F. Multi-Select/Checkbox Fields

| Trường | Chức năng | Min Selection | Required |
|--------|-----------|---------------|---------|
| DANHSACHSAN | AD007 (Tạo/Sửa) | 1 sân | ✅ |

### G. Text Area Fields

| Trường | Chức năng | Min | Max | Required |
|--------|-----------|-----|-----|---------|
| GHICHU | AD004 (Xác nhận) | 1 | 500 | ❌ Có* |
| MOTA | AD007 (Tạo/Sửa) | 0 | 1000 | ❌ |

### H. File Upload Fields

| Trường | Chức năng | Format | Max Size | Required |
|--------|-----------|--------|----------|---------|
| IMAGE_URL | AD003 (Thêm) | .jpg, .png, .gif, .webp | 5MB | ✅ |
| IMAGE_URL | AD003 (Sửa) | .jpg, .png, .gif, .webp | 5MB | ❌ |

---

## Hướng dẫn sử dụng bảng

- **STT**: Số thứ tự từ 1 đến 51
- **Chức năng**: Mã chức năng (AD001-AD007) + tên hoạt động
- **Type**: Loại input (Text Field, Select, Date Picker, v.v.)
- **Min Length**: Độ dài tối thiểu (cho Text)
- **Max Length**: Độ dài tối đa hoặc giới hạn giá trị
- **Required**: ✅ (bắt buộc), ❌ (không bắt buộc), ❌ Có* (bắt buộc trong trường hợp cụ thể)
- **Mô tả**: Thông tin về trường dữ liệu
```


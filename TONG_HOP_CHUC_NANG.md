# TỔNG HỢP CHỨC NĂNG HỆ THỐNG QUẢN LÝ PICKLEBALL

| STT | Tác nhân | Tên chức năng | Mục đích | Dữ liệu yêu cầu | Kiểm tra dữ liệu | Quy tắc nghiệp vụ |
|-----|---------|---------------|---------|-----------------|-----------------|------------------|
| 1 | Khách hàng | Đăng nhập | Xác thực danh tính người dùng | Username, Password | - Username không rỗng<br/>- Password không rỗng | - So sánh username, password với DB<br/>- Lưu thông tin vào localStorage |
| 2 | Khách hàng | Đăng ký tài khoản | Tạo tài khoản mới cho khách hàng | Username, Password, Tên KH, SĐT, Email | - Username độc nhất<br/>- Password >= 6 ký tự<br/>- SĐT hợp lệ<br/>- Email hợp lệ | - Kiểm tra username chưa tồn tại<br/>- Mã KH tự sinh (KHxxx)<br/>- Mã hóa password |
| 3 | Khách hàng | Xem trang chủ | Hiển thị thông tin, dịch vụ, giới thiệu | Không | Không | Hiển thị banner, thông tin sân, các dịch vụ |
| 4 | Khách hàng | Đặt sân ngày | Đặt sân Pickleball theo ngày | Ngày, Giờ vào, Giờ ra, Sân, Ghi chú | - Ngày >= hôm nay<br/>- Giờ vào < Giờ ra<br/>- Sân hợp lệ<br/>- Giờ trong khoảng 5-24h | - Tính tổng giờ<br/>- Tính tổng tiền (giờ trước 16h: 100k/h, sau 16h: 160k/h)<br/>- Kiểm tra sân có slot trống<br/>- Lưu vào DB với trạng thái "pending" |
| 5 | Khách hàng | Đặt sân tháng | Đặt sân Pickleball theo tháng | Sân, Ngày bắt đầu, Ngày kết thúc, Danh sách ngày, Giờ bắt đầu, Giờ kết thúc | - Ngày bắt đầu <= Ngày kết thúc<br/>- Ít nhất 1 ngày được chọn<br/>- Giờ bắt đầu < Giờ kết thúc | - Tính tổng giờ<br/>- Tính tổng tiền<br/>- Áp dụng giảm giá 10%<br/>- Tạo các slot cho từng ngày<br/>- Lưu vào DB |
| 6 | Khách hàng | Xé vé sự kiện | Đăng ký tham gia sự kiện Pickleball | Sự kiện, Số lượng slot | - Sự kiện hợp lệ<br/>- Số lượng slot > 0<br/>- Tổng slot <= số lượng tối đa | - Kiểm tra trạng thái sự kiện "Mở"<br/>- Cập nhật số người đã đăng ký<br/>- Kiểm tra không vượt quá số tối đa |
| 7 | Khách hàng | Xem chi tiết sự kiện | Xem thông tin chi tiết của sự kiện | ID sự kiện | ID sự kiện hợp lệ | Lấy thông tin từ DB và hiển thị |
| 8 | Khách hàng | Xem profile | Xem/cập nhật thông tin cá nhân | Mã KH | Mã KH hợp lệ | Lấy thông tin từ DB và cho phép sửa |
| 9 | Khách hàng | Xem dịch vụ | Xem danh sách dịch vụ bổ sung (thuê vợt, bóng) | Không | Không | Hiển thị danh sách dịch vụ có sẵn |
| 10 | Admin | Xem Dashboard | Xem tổng quan thống kê | Không | Không | - Tính doanh thu đặt sân ngày<br/>- Tính doanh thu đặt sân tháng<br/>- Tính tổng doanh thu<br/>- Thống kê số lượng booking |
| 11 | Admin | Quản lý sân | Xem, thêm, sửa, xóa thông tin sân | Mã sân, Tên sân, Loại sân, Giá thuê trước 16h, Giá thuê sau 16h, Trạng thái | - Mã sân độc nhất<br/>- Tên sân không rỗng<br/>- Giá > 0 | - Lưu/cập nhật DB<br/>- Kiểm tra không xóa sân có booking |
| 12 | Admin | Xác nhận đặt sân | Xác nhận/từ chối booking sân ngày | Mã booking, Trạng thái xác nhận | Mã booking hợp lệ | - Cập nhật trạng thái: confirmed/rejected<br/>- Gửi thông báo cho KH |
| 13 | Admin | Kiểm tra sân hôm nay | Xem các booking trong ngày hôm nay | Ngày hiện tại | Ngày hợp lệ | Lọc booking theo ngày hiện tại |
| 14 | Admin | Quản lý danh mục | Xem, thêm, sửa, xóa danh mục | ID danh mục, Tên, Slug, Ảnh | - Tên không rỗng<br/>- Slug độc nhất | Lưu/cập nhật/xóa trong DB |
| 15 | Admin | Quản lý tài khoản | Xem, thêm, sửa, xóa tài khoản người dùng | Mã TK, Username, Password, Role | - Username độc nhất<br/>- Password không rỗng<br/>- Role hợp lệ | - Tạo/cập nhật/xóa TK<br/>- Mã hóa password |
| 16 | Admin | Quản lý xé vé | Xem, thêm sự kiện xé vé | Tên sự kiện, Danh sách sân, Thời gian, Ngày tổ chức, Số lượng tối đa, Trạng thái | - Ngày tổ chức hợp lệ<br/>- Số lượng tối đa > 0<br/>- Thời gian hợp lệ | - Tạo sự kiện trong DB<br/>- Quản lý trạng thái "Mở/Khóa" |

## BẢNG PHÂN QUYỀN

| Chức năng | Khách hàng | Admin |
|-----------|-----------|-------|
| Đăng nhập/Đăng ký | ✅ | ✅ |
| Xem trang chủ | ✅ | ✅ |
| Đặt sân ngày | ✅ | ❌ |
| Đặt sân tháng | ✅ | ❌ |
| Xé vé | ✅ | ❌ |
| Xem profile | ✅ | ✅ |
| Xem Dashboard | ❌ | ✅ |
| Quản lý sân | ❌ | ✅ |
| Xác nhận booking | ❌ | ✅ |
| Kiểm tra sân hôm nay | ❌ | ✅ |
| Quản lý danh mục | ❌ | ✅ |
| Quản lý tài khoản | ❌ | ✅ |
| Quản lý sự kiện xé vé | ❌ | ✅ |

## GHI CHÚ THÊM

### Dữ liệu chính
- **tbl_khachhang**: Lưu thông tin khách hàng (MaKH, TenKh, GioiTinh, SDT, DiaChi, email)
- **tbl_taikhoankhachhang**: Lưu tài khoản đăng nhập khách hàng (id, userName, passWord, TenKh, SDT, email)
- **tbl_san**: Lưu thông tin sân (MaSan, TenSan, LoaiSan, GiaThueTruoc16, GiaThueSau16, TrangThai)
- **tbl_datsan**: Lưu booking sân ngày (MaDatSan, MaSan, MaKH, MaNV, NgayLap, GioVao, GioRa, TongGio, TongTien, TrangThai)
- **tbl_datsanthang**: Lưu booking sân tháng (MaDatSanThang, MaKH, MaNV, DanhSachSan, NgayBatDau, NgayKetThuc, GioBatDau, GioKetThuc, TongTien, TrangThaiThanhToan)
- **tbl_xeve_sukien**: Lưu sự kiện xé vé (MaXeVe, TenSuKien, DanhSachSan, ThoiGianBatDau, ThoiGianKetThuc, NgayToChuc, TongSoNguoi, SoLuongToiDa, TrangThai)
- **tbl_xeve_datve**: Lưu booking xé vé (MaDatVe, MaXeVe, MaKH, NguoiLap, SoLuongSlot, GhiChu)
- **categories**: Lưu danh mục (id, name, slug, image_url)

### API Endpoints chính
- `/api/admin/taikhoan/login` - Đăng nhập
- `/api/admin/taikhoan/loginKhachHang` - Đăng nhập khách hàng
- `/api/admin/taikhoan/registerKhachHang` - Đăng ký khách hàng
- `/api/admin/san` - Quản lý sân
- `/api/admin/datsan` - Quản lý booking sân ngày
- `/api/admin/santhang` - Quản lý booking sân tháng
- `/api/admin/xeve/sukien` - Quản lý sự kiện xé vé
- `/api/admin/xeve/datve` - Quản lý booking xé vé
- `/api/admin/categories` - Quản lý danh mục

import { db } from "../../../config/db.js";

// Hàm sinh ID ngẫu nhiên (KH + 3 số)
function generateRandomId(length = 3) {
  const chars = "0123456789";
  let result = "KH";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


export async function registerKhachHang(req, res) {
  try {
    const { userName, passWord, email, sdt, tenKh, gioiTinh } = req.body; // Thêm gioiTinh nếu form đăng ký có

    if (!userName || !passWord || !email || !sdt || !tenKh) {
      return res.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // 1. Kiểm tra trùng lặp trong tbl_taikhoankhachhang (tài khoản đã đăng ký)
    const [existTK] = await db.execute(
      "SELECT id FROM tbl_taikhoankhachhang WHERE userName = ? OR email = ? OR SDT = ?",
      [userName, email, sdt]
    );

    if (existTK.length > 0) {
      return res.json({
        success: false,
        message: "Tên đăng nhập, email hoặc SĐT đã tồn tại trong tài khoản khác.",
      });
    }

    let customerId; // ID sẽ được sử dụng cho cả tbl_taikhoankhachhang và tbl_khachhang
    let isExistingGuestCustomer = false;

    // 2. Kiểm tra xem email hoặc SĐT đã tồn tại trong tbl_khachhang (khách vãng lai)
    const [existKH] = await db.execute(
      "SELECT id, TenKh, SDT, email, DiaChi, GioiTinh FROM tbl_khachhang WHERE email = ? OR SDT = ?",
      [email, sdt]
    );

    if (existKH.length > 0) {
      // Khách hàng đã tồn tại trong tbl_khachhang (có thể từ guest checkout)
      customerId = existKH[0].id;
      isExistingGuestCustomer = true;

      // Kiểm tra xem ID này đã có tài khoản đăng nhập liên kết chưa
      const [linkedAccount] = await db.execute(
        "SELECT id FROM tbl_taikhoankhachhang WHERE id = ?",
        [customerId]
      );

      if (linkedAccount.length > 0) {
        // Trường hợp này xảy ra nếu email/sdt trùng với một khách hàng đã đăng ký
        // (Mặc dù đã kiểm tra ở bước 1, nhưng đây là một lớp bảo vệ bổ sung)
        return res.json({
          success: false,
          message: "Email hoặc SĐT đã được liên kết với một tài khoản khác.",
        });
      }

      // Nếu tbl_khachhang tồn tại nhưng chưa có tài khoản đăng nhập liên kết,
      // chúng ta sẽ sử dụng customerId này để tạo tài khoản mới và liên kết.
      // Cập nhật thông tin tbl_khachhang nếu có thay đổi từ form đăng ký
      await db.execute(
        "UPDATE tbl_khachhang SET TenKh = ?, SDT = ?, email = ? WHERE id = ?",
        [tenKh, sdt, email, customerId]
      );
      // Nếu form đăng ký có GioiTinh, có thể cập nhật thêm:
      if (gioiTinh) {
        await db.execute("UPDATE tbl_khachhang SET GioiTinh = ? WHERE id = ?", [gioiTinh, customerId]);
      }

    } else {
      // Khách hàng chưa tồn tại trong tbl_khachhang, tạo mới cả hai
      // Sinh ID ngẫu nhiên và đảm bảo không trùng cho cả tbl_taikhoankhachhang và tbl_khachhang
      let isUniqueAcc = false;
      while (!isUniqueAcc) {
        customerId = generateRandomId(3); // KH + 3 ký tự số
        const [rows] = await db.execute(
          "SELECT id FROM tbl_taikhoankhachhang WHERE id = ?",
          [customerId]
        );
        if (rows.length === 0) isUniqueAcc = true;
      }

      // Thêm vào tbl_khachhang mới
      await db.execute(
        "INSERT INTO tbl_khachhang (id, TenKh, SDT, email) VALUES (?, ?, ?, ?)",
        [customerId, tenKh, sdt, email]
      );
      // Nếu form đăng ký có GioiTinh, thêm vào:
      if (gioiTinh) {
        await db.execute("UPDATE tbl_khachhang SET GioiTinh = ? WHERE id = ?", [gioiTinh, customerId]);
      }
    }

    // Thêm vào tbl_taikhoankhachhang (sử dụng customerId đã xác định)
    await db.execute(
      "INSERT INTO tbl_taikhoankhachhang (id, userName, passWord, email, SDT) VALUES (?, ?, ?, ?, ?)",
      [customerId, userName, passWord, email, sdt]
    );

    res.json({ success: true, message: "Đăng ký khách hàng thành công" });
  } catch (err) {
    console.error(" Lỗi khi đăng ký khách hàng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

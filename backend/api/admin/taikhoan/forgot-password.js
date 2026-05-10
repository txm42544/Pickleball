import { db } from "../../../config/db.js";

export async function forgotPassword(req, res) {
  const { role, email, maTK, newPassword, confirmPassword } = req.body;

  try {
    // 🔹 Kiểm tra xác nhận mật khẩu
    if (!newPassword || !confirmPassword) {
      return res.json({ success: false, message: "Vui lòng nhập mật khẩu mới và xác nhận." });
    }

    if (newPassword !== confirmPassword) {
      return res.json({ success: false, message: "Mật khẩu xác nhận không khớp." });
    }

    if (role === "Nhân viên") {
      const [rows] = await db.execute(
        "SELECT * FROM tbl_taikhoan WHERE maTK = ? AND role = 'Nhân viên'",
        [maTK]
      );

      if (rows.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy tài khoản nhân viên." });
      }

      await db.execute(
        "UPDATE tbl_taikhoan SET passWord = ? WHERE maTK = ?",
        [newPassword, maTK]
      );

      return res.json({ success: true, message: "Cập nhật mật khẩu nhân viên thành công!" });

    } else if (role === "Quản lý") {
      const [rowsAdmin] = await db.execute(
        "SELECT * FROM tbl_taikhoan WHERE maTK = ? AND role = 'Quản lý'",
        [maTK]
      );

      if (rowsAdmin.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy tài khoản Quản lý." });
      }

      await db.execute(
        "UPDATE tbl_taikhoan SET passWord = ? WHERE maTK = ?",
        [newPassword, maTK]
      );

      return res.json({ success: true, message: "Cập nhật mật khẩu Quản lý thành công!" });

    } else if (role === "Khách hàng") {
      const [rowsKH] = await db.execute(
        "SELECT * FROM tbl_taikhoankhachhang WHERE email = ?",
        [email]
      );

      if (rowsKH.length === 0) {
        return res.json({ success: false, message: "Email không tồn tại." });
      }

      await db.execute(
        "UPDATE tbl_taikhoankhachhang SET passWord = ? WHERE email = ?",
        [newPassword, email]
      );

      return res.json({ success: true, message: "Cập nhật mật khẩu khách hàng thành công!" });

    } else {
      return res.json({ success: false, message: "Vai trò không hợp lệ." });
    }

  } catch (error) {
    console.error("❌ Lỗi khi đặt lại mật khẩu:", error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
}

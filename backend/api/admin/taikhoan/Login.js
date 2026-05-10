import { db } from "../../../config/db.js";

export async function login(req, res) {
  try {
    const { userName, passWord, role } = req.body;

    const [accounts] = await db.execute(
      "SELECT * FROM tbl_taikhoan WHERE userName = ? AND passWord = ? AND role = ?",
      [userName, passWord, role]
    );

    if (accounts.length === 0) {
      return res.json({
        success: false,
        message: "Sai tài khoản, mật khẩu hoặc vai trò!",
      });
    }

    const account = accounts[0];

    if (role === "Nhân viên") {
      const [nvRows] = await db.execute(
        "SELECT maNV, tenNV FROM tbl_nhanvien WHERE maTK = ?",
        [account.maTK]
      );

      if (nvRows.length > 0) {
        account.maNV = nvRows[0].maNV;
        account.userName = nvRows[0].tenNV; // 🔹 Gán tenNV cho userName
        account.tenNV = nvRows[0].tenNV; // tùy chọn, nếu muốn giữ riêng
      }
    }

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      user: account,
    });

  } catch (err) {
    console.error("❌ Lỗi khi đăng nhập:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

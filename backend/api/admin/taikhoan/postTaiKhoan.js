import { db } from "../../../config/db.js";

export async function postTaiKhoan(req, res) {
  try {
    const { userName, passWord, role } = req.body;

    if (!userName || !passWord || !role)
      return res.status(400).json({ message: "Thiếu tên đăng nhập, mật khẩu hoặc quyền" });

    // 1. Lấy mã TK cuối cùng
    const [rows] = await db.execute(
      "SELECT maTK FROM tbl_taikhoan ORDER BY maTK DESC LIMIT 1"
    );

    let newMaTK = "TK001"; // mặc định nếu chưa có tài khoản nào

    if (rows.length > 0) {
      const lastTK = rows[0].maTK;          // ví dụ: "TK005"
      const num = parseInt(lastTK.slice(2)) + 1; // lấy số và +1
      newMaTK = "TK" + String(num).padStart(3, "0"); // TK006
    }

    // 2. Chèn dữ liệu mới
    const [result] = await db.execute(
      "INSERT INTO tbl_taikhoan (maTK, userName, passWord, role) VALUES (?, ?, ?, ?)",
      [newMaTK, userName, passWord, role]
    );

    res.json({ message: "✅ Thêm tài khoản thành công", maTK: newMaTK });
  } catch (err) {
    console.error("❌ Lỗi khi thêm tài khoản:", err);
    res.status(500).json({ message: "Lỗi khi thêm tài khoản", error: err.message });
  }
}

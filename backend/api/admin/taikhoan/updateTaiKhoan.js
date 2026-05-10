import { db } from "../../../config/db.js";

export async function updateTaiKhoan(req, res) {
  try {
    const { maTK, userName, passWord, role } = req.body;

    if (!maTK) return res.status(400).json({ message: "Thiếu mã tài khoản" });

    const [result] = await db.execute(
      "UPDATE tbl_taikhoan SET userName = ?, passWord = ?, role = ? WHERE maTK = ?",
      [userName, passWord, role, maTK]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    res.json({ message: "✅ Cập nhật tài khoản thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật tài khoản:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật tài khoản", error: err.message });
  }
}

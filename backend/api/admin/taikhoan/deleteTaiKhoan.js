import { db } from "../../../config/db.js";

export async function deleteTaiKhoan(req, res) {
  try {
    const { maTK } = req.params;
    if (!maTK) return res.status(400).json({ message: "Thiếu mã tài khoản" });

    const [result] = await db.execute("DELETE FROM tbl_taikhoan WHERE maTK = ?", [maTK]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy tài khoản cần xóa" });

    res.json({ message: "✅ Xóa tài khoản thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa tài khoản:", err);
    res.status(500).json({ message: "Lỗi khi xóa tài khoản", error: err.message });
  }
}

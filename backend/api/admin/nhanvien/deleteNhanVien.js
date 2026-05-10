import { db } from "../../../config/db.js";

export async function deleteNhanVien(req, res) {
  try {
    const { maNV } = req.params;
    if (!maNV) return res.status(400).json({ message: "Thiếu mã nhân viên" });

    const [result] = await db.execute("DELETE FROM tbl_nhanvien WHERE maNV = ?", [maNV]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy nhân viên cần xóa" });

    res.json({ message: "✅ Xóa nhân viên thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa nhân viên:", err);
    res.status(500).json({
      message: "Lỗi khi xóa nhân viên",
      error: err.message,
    });
  }
}

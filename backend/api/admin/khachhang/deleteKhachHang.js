import { db } from "../../../config/db.js";

export async function deleteKhachHang(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Thiếu ID khách hàng" });

    const [result] = await db.execute("DELETE FROM tbl_khachhang WHERE MaKH = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy khách hàng cần xóa" });

    res.json({ message: "✅ Xóa khách hàng thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa khách hàng:", err);
    res.status(500).json({
      message: "Lỗi khi xóa khách hàng",
      error: err.message,
    });
  }
}

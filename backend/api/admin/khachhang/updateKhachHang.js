import { db } from "../../../config/db.js";

export async function updateKhachHang(req, res) {
  try {
    const { id } = req.params;
    const { TenKh, SDT, DiaChi, Email } = req.body;
    const MaKh = id || req.body.MaKH;
    
    if (!MaKh) return res.status(400).json({ message: "Thiếu mã khách hàng" });

    const [result] = await db.execute(
      `UPDATE tbl_khachhang 
       SET TenKh = ?, SDT = ?, DiaChi = ?, Email = ?
       WHERE MaKH = ?`,
      [TenKh, SDT, DiaChi, Email, MaKh]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });

    res.json({ message: "✅ Cập nhật khách hàng thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật khách hàng:", err);
    res.status(500).json({
      message: "Lỗi khi cập nhật khách hàng",
      error: err.message,
    });
  }
}

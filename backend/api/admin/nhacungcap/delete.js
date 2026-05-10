import { db } from "../../../config/db.js";

export async function deleteNhaCungCap(req, res) {
  try {
    const { id } = req.params;

    // KIỂM TRA XEM NHÀ CUNG CẤP CÓ SẢN PHẨM NÀO KHÔNG
    // Sửa lại: products không có supplier_id, kiểm tra qua bảng khác
    const [phieuNhap] = await db.execute(
      "SELECT COUNT(*) as count FROM phieunhap WHERE nhacungcap_id = ?",
      [id]
    );

    if (phieuNhap[0].count > 0) {
      return res.status(400).json({
        error: "Không thể xóa nhà cung cấp vì có phiếu nhập liên quan"
      });
    }

    // Xóa nhà cung cấp
    const [result] = await db.execute("DELETE FROM nhacungcap WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy nhà cung cấp" });
    }

    res.json({
      message: "✅ Xóa nhà cung cấp thành công!",
      data: { id: parseInt(id) }
    });

  } catch (error) {
    console.error("❌ Lỗi xóa nhà cung cấp:", error);
    res.status(500).json({ error: error.message });
  }
}
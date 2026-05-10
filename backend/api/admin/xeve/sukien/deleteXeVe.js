// 📄 api/xeve/deleteXeVe.js
import { db } from "../../../../config/db.js";

export async function deleteXeVe(req, res) {
  try {
    const { MaXeVe } = req.params;

    if (!MaXeVe) {
      return res.status(400).json({ message: "❌ MaXeVe không được để trống." });
    }

    // Kiểm tra sự kiện có tồn tại không
    const [check] = await db.execute(
      "SELECT MaXeVe FROM tbl_xeve_sukien WHERE MaXeVe = ?",
      [MaXeVe]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy sự kiện cần xóa." });
    }

    // Xóa sự kiện
    const [result] = await db.execute(
      "DELETE FROM tbl_xeve_sukien WHERE MaXeVe = ?",
      [MaXeVe]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "❌ Xóa sự kiện thất bại." });
    }

    res.json({
      message: "✅ Đã xóa sự kiện thành công!",
      deletedId: MaXeVe,
    });
  } catch (err) {
    console.error("❌ Lỗi khi xóa sự kiện:", err);
    res.status(500).json({
      message: "❌ Lỗi máy chủ khi xóa sự kiện.",
      error: err.message,
    });
  }
}

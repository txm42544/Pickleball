// 📄 api/xeve/putXeVeStatus.js
import { db } from "../../../../config/db.js";

export async function putXeVeStatus(req, res) {
  try {
    const { MaXeVe } = req.params;

    // ✅ Check MaXeVe có tồn tại
    if (!MaXeVe) {
      return res.status(400).json({ message: "❌ MaXeVe không được để trống." });
    }

    // 🔍 Lấy trạng thái hiện tại
    const [rows] = await db.execute(
      "SELECT TrangThai FROM tbl_xeve_sukien WHERE MaXeVe = ?",
      [MaXeVe]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy sự kiện cần cập nhật." });
    }

    // 🌀 Xác định trạng thái mới
    const currentStatus = rows[0].TrangThai?.trim() || "Mở"; // fallback nếu null
    const newStatus = currentStatus === "Mở" ? "Khóa" : "Mở";

    console.log("MaXeVe:", MaXeVe, "Current:", currentStatus, "New:", newStatus);

    // 💾 Cập nhật trong DB
    const [result] = await db.execute(
      "UPDATE tbl_xeve_sukien SET TrangThai = ? WHERE MaXeVe = ?",
      [newStatus, MaXeVe]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        message: "❌ Không thể cập nhật trạng thái. Kiểm tra giá trị enum trong DB.",
      });
    }

    // ✅ Phản hồi
    res.json({
      message: "✅ Đã cập nhật trạng thái sự kiện thành công!",
      updatedId: MaXeVe,
      newStatus,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật trạng thái sự kiện:", err);
    res.status(500).json({
      message: "❌ Lỗi máy chủ khi cập nhật trạng thái.",
      error: err.message,
    });
  }
}

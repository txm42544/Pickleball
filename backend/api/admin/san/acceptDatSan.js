import { db } from "../../../config/db.js";

// PUT hoặc POST đều được
export async function acceptDatSan(req, res) {
  try {
    const { MaDatSan } = req.body;

    if (!MaDatSan) {
      return res.status(400).json({ success: false, message: "Thiếu MaDatSan" });
    }

    // Cập nhật trạng thái từ pending -> accepted
    const [result] = await db.execute(
      `UPDATE tbl_datsan 
       SET TrangThai = 'accepted' 
       WHERE MaDatSan = ?`,
      [MaDatSan]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy booking" });
    }

    res.json({ success: true, message: "✅ Booking đã được chấp nhận" });
  } catch (err) {
    console.error("❌ Lỗi acceptDatSan:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

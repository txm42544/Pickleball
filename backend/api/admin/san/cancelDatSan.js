import { db } from "../../../config/db.js";

export async function cancelDatSan(req, res) {
  try {
    const { MaDatSan } = req.body;

    if (!MaDatSan) {
      return res
        .status(400)
        .json({ success: false, message: "Missing MaDatSan" });
    }

    const [result] = await db.execute(
      `UPDATE tbl_datsan SET TrangThai = 'cancelled' WHERE MaDatSan = ?`,
      [MaDatSan]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }


    // Hẹn giờ xóa vĩnh viễn sau 3 giây
    setTimeout(async () => {
      try {
        await db.execute("DELETE FROM tbl_datsan WHERE MaDatSan = ?", [MaDatSan]);
        console.log(`🗑️ Đã xóa booking ${MaDatSan} sau khi hủy`);
      } catch (errDel) {
        console.error("❌ Lỗi xóa booking sau hủy:", errDel);
      }
    }, 3000);

    res.json({ success: true, message: "Booking cancelled. Sẽ xóa sau 3s." });
  } catch (err) {
    console.error("Error cancelDatSan:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

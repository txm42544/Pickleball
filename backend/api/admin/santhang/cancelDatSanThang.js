import { db } from "../../../config/db.js";

export async function cancelDatSanThang(req, res) {
  try {
    const { MaDatSanThang } = req.body;

    if (!MaDatSanThang) {
      return res
        .status(400)
        .json({ success: false, message: "Missing MaDatSanThang" });
    }

    const [result] = await db.execute(
      `UPDATE tbl_datsanthang SET TrangThai = 'Hủy' WHERE MaDatSanThang = ?`,
      [MaDatSanThang]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Hẹn giờ xóa vĩnh viễn sau 3 giây
    setTimeout(async () => {
      try {
        await db.execute("DELETE FROM tbl_datsanthang WHERE MaDatSanThang = ?", [MaDatSanThang]);
        console.log(`🗑️ Đã xóa booking tháng ${MaDatSanThang} sau khi hủy`);
      } catch (errDel) {
        console.error("❌ Lỗi xóa booking tháng sau hủy:", errDel);
      }
    }, 3000);

    res.json({ success: true, message: "Monthly booking cancelled. Sẽ xóa sau 3s." });
  } catch (err) {
    console.error("Error cancelDatSanThang:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

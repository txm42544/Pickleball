import { db } from "../../../config/db.js";

export async function acceptDatSanThang(req, res) {
  try {
    const { MaDatSanThang } = req.body;

    if (!MaDatSanThang) {
      return res.status(400).json({ success: false, message: "Missing MaDatSanThang" });
    }

    const [exists] = await db.execute(
      `SELECT MaDatSanThang, TrangThai FROM tbl_datsanthang WHERE MaDatSanThang = ? LIMIT 1`,
      [MaDatSanThang]
    );

    if (!exists.length) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const currentStatus = String(exists[0].TrangThai || "");
    if (currentStatus === "Hoạt động") {
      return res.json({
        success: true,
        message: "Monthly booking is already accepted.",
        data: {
          MaDatSanThang,
          TrangThai: "Hoạt động",
        },
      });
    }

    await db.execute(
      `UPDATE tbl_datsanthang SET TrangThai = 'Hoạt động' WHERE MaDatSanThang = ?`,
      [MaDatSanThang]
    );

    res.json({
      success: true,
      message: "Monthly booking accepted.",
      data: {
        MaDatSanThang,
        TrangThai: "Hoạt động",
      },
    });
  } catch (err) {
    console.error("Error acceptDatSanThang:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

import { db } from "../../../config/db.js";

// Lấy lịch sử đặt sân ngày theo MaKH
export async function getBookingHistoryByKH(req, res) {
  try {
    const { MaKH } = req.query;
    
    if (!MaKH) {
      return res.status(400).json({ message: "Thiếu mã khách hàng!" });
    }

    const [rows] = await db.execute(`
      SELECT ds.*, s.TenSan
      FROM tbl_datsan ds
      LEFT JOIN tbl_san s ON ds.MaSan = s.MaSan
      WHERE ds.MaKH = ?
      ORDER BY ds.NgayLap DESC
    `, [MaKH]);

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy lịch sử đặt sân ngày:", err);
    res.status(500).json({ message: "Lỗi khi lấy lịch sử đặt sân ngày", error: err.message });
  }
}

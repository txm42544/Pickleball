import { db } from "../../../../config/db.js";

// Lấy lịch sử đặt vé xé vé theo MaKH
export async function getDatVeHistoryByKH(req, res) {
  try {
    const { MaKH } = req.query;
    
    console.log("🔍 API datveHistory - MaKH nhận được:", MaKH);
    
    if (!MaKH) {
      return res.status(400).json({ message: "Thiếu mã khách hàng!" });
    }

    const [rows] = await db.execute(`
      SELECT dv.*, sk.TenSuKien, sk.NgayToChuc, sk.ThoiGianBatDau, sk.ThoiGianKetThuc
      FROM tbl_xeve_datve dv
      LEFT JOIN tbl_xeve_sukien sk ON dv.MaXeVe = sk.MaXeVe
      WHERE dv.MaKH = ?
      ORDER BY dv.ThoiGianDangKy DESC
    `, [MaKH]);

    console.log("📊 API datveHistory - Số kết quả:", rows.length);
    
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy lịch sử đặt vé:", err);
    res.status(500).json({ message: "Lỗi khi lấy lịch sử đặt vé", error: err.message });
  }
}

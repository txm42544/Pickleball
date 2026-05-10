import { db } from "../../../../config/db.js";

export async function getAllXeVe(req, res) {
  try {
    const { from, to, keyword } = req.query;

    let sql = `
      SELECT 
        s.MaXeVe,
        s.TenSuKien,
        s.DanhSachSan,
        s.ThoiGianBatDau,
        s.ThoiGianKetThuc,
        s.NgayToChuc,
        s.SoLuongToiDa,
        s.MaNV,
        s.GhiChu,
        s.TrangThai,
        s.NgayTao,
        COALESCE(SUM(d.SoLuongSlot), 0) AS TongSoNguoi
      FROM tbl_xeve_sukien s
      LEFT JOIN tbl_xeve_datve d ON s.MaXeVe = d.MaXeVe
      WHERE 1=1
    `;

    const params = [];

    // Bộ lọc theo khoảng thời gian
    if (from && to) {
      sql += ` AND s.NgayToChuc BETWEEN ? AND ?`;
      params.push(from, to);
    }

    // Bộ lọc theo tên sự kiện
    if (keyword) {
      sql += ` AND s.TenSuKien LIKE ?`;
      params.push(`%${keyword}%`);
    }

    sql += ` GROUP BY s.MaXeVe ORDER BY s.NgayToChuc DESC`;

    const [rows] = await db.execute(sql, params);

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách sự kiện xé vé:", err);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sự kiện xé vé",
      error: err.message,
    });
  }
}

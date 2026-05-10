import { db } from "../../../config/db.js";

export async function searchKhachHang(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const [rows] = await db.execute(
      "SELECT * FROM tbl_khachhang WHERE TenKh LIKE ? OR SDT LIKE ?",
      [`%${q}%`, `%${q}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm khách:", err);
    res.status(500).json({
      message: "Lỗi khi tìm kiếm khách hàng",
      error: err.message,
    });
  }
}

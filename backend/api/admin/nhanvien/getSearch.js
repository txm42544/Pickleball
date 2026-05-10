import { db } from "../../../config/db.js";

export async function searchNhanVien(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const [rows] = await db.execute(
      "SELECT * FROM tbl_nhanvien WHERE tenNV LIKE ? OR maNV LIKE ?",
      [`%${q}%`, `%${q}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm nhân viên:", err);
    res.status(500).json({
      message: "Lỗi khi tìm kiếm nhân viên",
      error: err.message,
    });
  }
}

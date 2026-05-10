import { db } from "../../../config/db.js";

export async function searchTaiKhoan(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const [rows] = await db.execute(
      "SELECT * FROM tbl_taikhoan WHERE userName LIKE ? OR maTK LIKE ?",
      [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi tìm kiếm tài khoản:", err);
    res.status(500).json({ message: "Lỗi khi tìm kiếm tài khoản" });
  }
}

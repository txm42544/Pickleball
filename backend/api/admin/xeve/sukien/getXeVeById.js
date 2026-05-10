import { db } from "../../../../config/db.js";

export async function getXeVeById(req, res) {
  try {
    const { MaXeVe } = req.params;
    const [rows] = await db.execute(
      "SELECT * FROM tbl_xeve_sukien WHERE MaXeVe = ?",
      [MaXeVe]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết sự kiện:", err);
    res.status(500).json({ message: "Lỗi máy chủ.", error: err.message });
  }
}

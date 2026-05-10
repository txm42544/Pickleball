// 📄 api/xeve/getXeVe.js
import { db } from "../../../../config/db.js";

export async function getXeVe(req, res) {
  try {
    const { keyword, from, to } = req.query;

    let sql = "SELECT * FROM tbl_xeve_sukien WHERE 1=1";
    const params = [];

    // 🔍 Tìm theo tên sự kiện
    if (keyword) {
      sql += " AND TenSuKien LIKE ?";
      params.push(`%${keyword}%`);
    }

    // 📅 Tìm theo khoảng ngày
    if (from && to) {
      sql += " AND NgayToChuc BETWEEN ? AND ?";
      params.push(from, to);
    } else if (from) {
      sql += " AND NgayToChuc >= ?";
      params.push(from);
    } else if (to) {
      sql += " AND NgayToChuc <= ?";
      params.push(to);
    }

    sql += " ORDER BY NgayToChuc DESC";

    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách sự kiện:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách sự kiện", error: err.message });
  }
}

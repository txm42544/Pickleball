import { db } from "../../../config/db.js";

export async function getAllNhanVien(req, res) {
  try {
    const [rows] = await db.execute("SELECT * FROM tbl_nhanvien");
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách nhân viên:", err);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách",
      error: err.message,
    });
  }
}

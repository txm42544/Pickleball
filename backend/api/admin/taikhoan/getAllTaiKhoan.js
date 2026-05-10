import { db } from "../../../config/db.js";

export async function getAllTaiKhoan(req, res) {
  try {
    const [rows] = await db.execute("SELECT * FROM tbl_taikhoan");
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách tài khoản:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách tài khoản" });
  }
}

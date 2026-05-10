import { db } from "../../../config/db.js";

export async function getAllNhaCungCap(req, res) {
  try {
    const [rows] = await db.execute("SELECT * FROM nhacungcap ORDER BY created_at DESC");

    res.json({
      message: "Lấy danh sách nhà cung cấp thành công!",
      data: rows
    });
  } catch (error) {
    console.error("❌ Lỗi lấy nhà cung cấp:", error);
    res.status(500).json({ error: error.message });
  }
}

export default { getAllNhaCungCap };
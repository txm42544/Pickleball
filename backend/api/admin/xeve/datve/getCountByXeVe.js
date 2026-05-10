import { db } from "../../../../config/db.js";

// Lấy tổng số slot đã đặt theo mã xé vé
export async function getCountByXeVe(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT MaXeVe, SUM(SoLuongSlot) AS TongSlot
      FROM tbl_xeve_datve
      GROUP BY MaXeVe
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy tổng slot đặt:", err);
    res.status(500).json({
      message: "Lỗi khi lấy tổng slot đặt",
      error: err.message,
    });
  }
}

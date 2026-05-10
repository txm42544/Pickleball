import { db } from "../../../config/db.js";

export async function getThongKePhieuNhap(req, res) {
  try {
    const sql = `
      SELECT 
        COUNT(*) as tong_phieunhap,
        SUM(tongtien) as tong_tien,
        AVG(tongtien) as trungbinh_tien
      FROM phieunhap
    `;

    const [row] = await db.execute(sql);

    res.json({
      message: "Lấy thống kê phiếu nhập thành công!",
      data: row[0]
    });
  } catch (error) {
    console.error(" Lỗi lấy thống kê phiếu nhập:", error);
    res.status(500).json({ error: error.message });
  }
}
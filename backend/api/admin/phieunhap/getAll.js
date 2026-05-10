import { db } from "../../../config/db.js";

export async function getAllPhieuNhap(req, res) {
  try {
    const sql = `
      SELECT pn.*, ncc.ten as ten_nhacungcap, COUNT(ctpn.id) as tong_sanpham
      FROM phieunhap pn
      LEFT JOIN nhacungcap ncc ON pn.nhacungcap_id = ncc.id
      LEFT JOIN chitietphieunhap ctpn ON pn.id = ctpn.phieunhap_id
      GROUP BY pn.id
      ORDER BY pn.created_at DESC
    `;

    const [rows] = await db.execute(sql);

    res.json({
      message: "Lấy danh sách phiếu nhập thành công!",
      data: rows
    });
  } catch (error) {
    console.error("❌ Lỗi lấy phiếu nhập:", error);
    res.status(500).json({ error: error.message });
  }
}

// Export default để tránh lỗi
export default { getAllPhieuNhap };
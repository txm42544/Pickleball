import { db } from "../../../config/db.js";

export async function getKhachHangByMaKH(req, res) {
  try {
    const { MaKH } = req.query;
    if (!MaKH) return res.status(400).json({ message: "Thiếu MaKH" });

    const [rows] = await db.execute(
      "SELECT * FROM tbl_khachhang WHERE id = ?",
      [MaKH]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy khách hàng" });

    res.json(rows[0]); // trả về 1 khách hàng
  } catch (err) {
    console.error("❌ Lỗi lấy khách hàng:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

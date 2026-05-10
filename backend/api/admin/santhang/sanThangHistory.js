import { db } from "../../../config/db.js";

const normalizeStatus = (status) =>
  String(status || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isCancelledStatus = (status) => {
  const norm = normalizeStatus(status);
  return norm.includes("huy") || norm.includes("cancel");
};

// Lấy lịch sử đặt sân tháng theo MaKH, bỏ qua các bản ghi đã hủy
export async function getSanThangHistoryByKH(req, res) {
  try {
    const { MaKH } = req.query;

    if (!MaKH) {
      return res.status(400).json({ message: "Thiếu mã khách hàng!" });
    }

    const [rows] = await db.execute(
      `SELECT *
       FROM tbl_datsanthang
       WHERE MaKH = ?
       ORDER BY NgayLap DESC`,
      [MaKH]
    );

    const filtered = rows.filter((row) => !isCancelledStatus(row.TrangThai));

    res.json(filtered);
  } catch (err) {
    console.error("❌ Lỗi khi lấy lịch sử đặt sân tháng:", err);
    res.status(500).json({ message: "Lỗi khi lấy lịch sử đặt sân tháng", error: err.message });
  }
}

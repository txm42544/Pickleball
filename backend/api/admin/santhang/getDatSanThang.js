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

/**
 * API: Lấy danh sách tất cả đặt sân tháng
 * - Có thể lọc theo MaKH (mã khách hàng)
 * - Có thể lọc theo TrangThai hoặc trạng thái thanh toán
 * 
 * GET /api/santhang/list?MaKH=KH001
 */

export async function getDatSanThang(req, res) {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const { MaKH, TrangThai, TrangThaiThanhToan } = req.query;

    // 🧩 Câu SQL cơ bản
    let sql = `SELECT 
      ds.MaDatSanThang, ds.MaKH, ds.MaNV, ds.DanhSachSan, ds.NgayBatDau, ds.NgayKetThuc,
      ds.DanhSachNgay, ds.GioBatDau, ds.GioKetThuc, ds.TongGio, ds.TongTien, ds.GiamGia,
      ds.TongTienThuc, ds.LoaiThanhToan, ds.SoTienDaThanhToan, ds.TrangThaiThanhToan,
      ds.GhiChu, ds.NgayLap, ds.TrangThai, ds.PaymentScreenshot,
      kh.TenKh AS TenKhach, kh.SDT AS KhachSDT, kh.email AS KhachEmail
      FROM tbl_datsanthang ds
      LEFT JOIN tbl_khachhang kh ON ds.MaKH = kh.id
      WHERE 1=1`;

    const params = [];

    // 🧩 Bộ lọc động
    if (MaKH) {
      sql += " AND ds.MaKH = ?";
      params.push(MaKH);
    }

    if (TrangThai) {
      sql += " AND ds.TrangThai = ?";
      params.push(TrangThai);
    }

    if (TrangThaiThanhToan) {
      sql += " AND ds.TrangThaiThanhToan = ?";
      params.push(TrangThaiThanhToan);
    }

    sql += " ORDER BY ds.NgayLap DESC";

    const [rows] = await db.execute(sql, params);

    // 📅 Parse JSON cho cột DanhSachNgay
    const result = rows.map((item) => ({
      ...item,
      DanhSachSan: item.DanhSachSan ? item.DanhSachSan.split(",") : [],
      DanhSachNgay: (() => {
        try {
          const parsed = JSON.parse(item.DanhSachNgay);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })(),
    }));

    const filtered = result.filter((item) => !isCancelledStatus(item.TrangThai));

    res.json({
      message: "✅ Lấy danh sách đặt sân tháng thành công!",
      count: filtered.length,
      data: filtered,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách đặt sân tháng:", err);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đặt sân tháng",
      error: err.message,
    });
  }
}

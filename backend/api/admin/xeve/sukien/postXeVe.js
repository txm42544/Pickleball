// 📄 api/xeve/postXeVe.js
import { db } from "../../../../config/db.js";

export async function postXeVe(req, res) {
  try {
    const {
      TenSuKien,
      DanhSachSan,
      ThoiGianBatDau,
      ThoiGianKetThuc,
      NgayToChuc,
      SoLuongToiDa,
      MaNV,
      GhiChu,
      TrangThai,
    } = req.body;

    // Khi tạo mới, số người tham gia luôn là 0
    const TongSoNguoi = 0;

    // ✅ Ép kiểu dữ liệu an toàn (đề phòng null hoặc undefined)
    const tenSuKien = String(TenSuKien || "").trim();
    const danhSachSan = String(DanhSachSan || "").trim();
    const tgBatDau = String(ThoiGianBatDau || "").trim();
    const tgKetThuc = String(ThoiGianKetThuc || "").trim();
    const ngayToChuc = String(NgayToChuc || "").trim();
    const soLuongToiDa = parseInt(SoLuongToiDa || 0);
    const maNV = String(MaNV || "").trim(); // 👈 ép kiểu về chuỗi để tương thích varchar(10)
    const ghiChu = String(GhiChu || "").trim();
    const trangThai = TrangThai && TrangThai !== "" ? TrangThai : "Mở";

    const sql = `
      INSERT INTO tbl_xeve_sukien 
      (TenSuKien, DanhSachSan, ThoiGianBatDau, ThoiGianKetThuc, NgayToChuc, TongSoNguoi, SoLuongToiDa, MaNV, GhiChu, TrangThai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      tenSuKien,
      danhSachSan,
      tgBatDau,
      tgKetThuc,
      ngayToChuc,
      TongSoNguoi,
      soLuongToiDa,
      maNV,
      ghiChu,
      trangThai,
    ]);

    res.json({
      message: "✅ Thêm sự kiện xé vé thành công!",
      insertedId: result.insertId,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sự kiện xé vé:", err);
    console.error("❌ Chi tiết SQL:", err.sqlMessage || err.message);
    res.status(500).json({
      message: "Lỗi khi thêm sự kiện xé vé",
      error: err.sqlMessage || err.message,
    });
  }
}

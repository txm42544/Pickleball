// 📄 api/xeve/putXeVe.js
import { db } from "../../../../config/db.js";

export async function putXeVe(req, res) {
  try {
    const { MaXeVe } = req.params;
    const {
      TenSuKien,
      DanhSachSan,
      ThoiGianBatDau,
      ThoiGianKetThuc,
      NgayToChuc,
      TongSoNguoi,
      SoLuongToiDa,
      MaNV,
      GhiChu,
      TrangThai,
    } = req.body;

    if (!MaXeVe) {
      return res.status(400).json({ message: "❌ MaXeVe không được để trống." });
    }

    // Kiểm tra sự kiện tồn tại chưa
    const [check] = await db.execute(
      "SELECT MaXeVe FROM tbl_xeve_sukien WHERE MaXeVe = ?",
      [MaXeVe]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: "❌ Không tìm thấy sự kiện cần cập nhật." });
    }

    // Cập nhật
    const [result] = await db.execute(
      `UPDATE tbl_xeve_sukien 
       SET TenSuKien = ?, DanhSachSan = ?, ThoiGianBatDau = ?, ThoiGianKetThuc = ?, 
           NgayToChuc = ?, TongSoNguoi = ?, SoLuongToiDa = ?, MaNV = ?, GhiChu = ?, TrangThai = ?
       WHERE MaXeVe = ?`,
      [
        TenSuKien,
        DanhSachSan,
        ThoiGianBatDau,
        ThoiGianKetThuc,
        NgayToChuc,
        TongSoNguoi ?? 0,
        SoLuongToiDa ?? 0,
        MaNV ?? null,
        GhiChu ?? null,
        TrangThai ?? "Mở",
        MaXeVe,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "❌ Cập nhật thất bại." });
    }

    res.json({
      message: "✅ Cập nhật sự kiện thành công!",
      updatedId: MaXeVe,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật sự kiện:", err);
    res.status(500).json({
      message: "❌ Lỗi máy chủ khi cập nhật sự kiện.",
      error: err.message,
    });
  }
}

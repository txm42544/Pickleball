import { db } from "../../../config/db.js";

export async function updateNhanVien(req, res) {
  try {
    const { maNV, tenNV, ngaySinh, gioiTinh, sdt, email, queQuan, maTK } = req.body;

    if (!maNV)
      return res.status(400).json({ message: "Thiếu mã nhân viên" });

    // 👉 Đảm bảo ngày đúng định dạng (nếu có)
    let formattedDate = null;
    if (ngaySinh) {
      const d = new Date(ngaySinh);
      if (!isNaN(d)) {
        formattedDate = d.toISOString().split("T")[0]; // yyyy-MM-dd
      }
    }

    // 👉 Thực hiện câu lệnh cập nhật
    const [result] = await db.execute(
      `UPDATE tbl_nhanvien
       SET tenNV = ?, ngaySinh = ?, gioiTinh = ?, sdt = ?, email = ?, queQuan = ?, maTK = ?
       WHERE maNV = ?`,
      [tenNV, formattedDate, gioiTinh, sdt, email, queQuan, maTK, maNV]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });

    res.json({ message: "✅ Cập nhật nhân viên thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật nhân viên:", err);
    res.status(500).json({
      message: "Lỗi khi cập nhật nhân viên",
      error: err.message,
    });
  }
}

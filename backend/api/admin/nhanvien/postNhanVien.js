import { db } from "../../../config/db.js";

export async function postNhanVien(req, res) {
  try {
    const { maNV, tenNV, ngaySinh, gioiTinh, sdt, email, queQuan, maTK } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!maNV || !tenNV || !sdt || !email)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc (mã NV, tên, SĐT hoặc email)" });

    if (maTK) {
      // Kiểm tra tồn tại trong tbl_taikhoan
      const [tkRows] = await db.execute(`SELECT maTK FROM tbl_taikhoan WHERE maTK = ?`, [maTK]);
      if (tkRows.length === 0) {
        return res.status(400).json({ message: `Tài khoản với maTK = ${maTK} không tồn tại.` });
      }

      // Kiểm tra trùng trong tbl_nhanvien
      const [nvRows] = await db.execute(`SELECT maNV FROM tbl_nhanvien WHERE maTK = ?`, [maTK]);
      if (nvRows.length > 0) {
        return res.status(400).json({ message: `Mã tài khoản ${maTK} đã được gán cho nhân viên khác.` });
      }
    }

    // Thêm nhân viên
    const [result] = await db.execute(
      `INSERT INTO tbl_nhanvien (maNV, tenNV, ngaySinh, gioiTinh, sdt, email, queQuan, maTK)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [maNV, tenNV, ngaySinh || null, gioiTinh || "Nam", sdt, email, queQuan || "", maTK || ""]
    );

    res.json({
      message: "✅ Thêm nhân viên thành công",
      insertedMaNV: maNV,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm nhân viên:", err);
    res.status(500).json({
      message: "Lỗi khi thêm nhân viên",
      error: err.message,
    });
  }
}

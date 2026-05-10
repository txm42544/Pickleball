import { db } from "../../../config/db.js";

// Lấy tất cả sân (không có bookings)
export async function getAllSanInfo(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT MaSan, TenSan, LoaiSan, GiaThueTruoc16, GiaThueSau16, TrangThai
      FROM tbl_san
      ORDER BY CAST(SUBSTRING(MaSan, 2) AS UNSIGNED)
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách sân:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách sân", error: err.message });
  }
}

// Thêm sân mới
export async function createSan(req, res) {
  try {
    const { MaSan, TenSan, LoaiSan, GiaThueTruoc16, GiaThueSau16, TrangThai } = req.body;
    
    if (!MaSan || !TenSan) {
      return res.status(400).json({ message: "Mã sân và Tên sân là bắt buộc!" });
    }

    // Kiểm tra mã sân đã tồn tại chưa
    const [existing] = await db.execute("SELECT MaSan FROM tbl_san WHERE MaSan = ?", [MaSan]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Mã sân đã tồn tại!" });
    }

    await db.execute(
      `INSERT INTO tbl_san (MaSan, TenSan, LoaiSan, GiaThueTruoc16, GiaThueSau16, TrangThai) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        MaSan,
        TenSan,
        LoaiSan || 'Thường',
        GiaThueTruoc16 || 100000,
        GiaThueSau16 || 160000,
        TrangThai || 'Hoạt động'
      ]
    );

    res.status(201).json({ message: "✅ Thêm sân thành công!", MaSan });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sân:", err);
    res.status(500).json({ message: "Lỗi khi thêm sân", error: err.message });
  }
}

// Cập nhật sân
export async function updateSan(req, res) {
  try {
    const { MaSan } = req.params;
    const { TenSan, LoaiSan, GiaThueTruoc16, GiaThueSau16, TrangThai } = req.body;

    if (!MaSan) {
      return res.status(400).json({ message: "Mã sân là bắt buộc!" });
    }

    // Kiểm tra sân tồn tại
    const [existing] = await db.execute("SELECT MaSan FROM tbl_san WHERE MaSan = ?", [MaSan]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sân!" });
    }

    await db.execute(
      `UPDATE tbl_san SET TenSan = ?, LoaiSan = ?, GiaThueTruoc16 = ?, GiaThueSau16 = ?, TrangThai = ? WHERE MaSan = ?`,
      [
        TenSan,
        LoaiSan || 'Thường',
        GiaThueTruoc16 || 100000,
        GiaThueSau16 || 160000,
        TrangThai || 'Hoạt động',
        MaSan
      ]
    );

    res.json({ message: "✅ Cập nhật sân thành công!", MaSan });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật sân:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật sân", error: err.message });
  }
}

// Xóa sân (hard-delete: xóa vĩnh viễn khỏi hệ thống)
export async function deleteSan(req, res) {
  let connection;
  try {
    const { MaSan } = req.params;

    if (!MaSan) {
      return res.status(400).json({ message: "Mã sân là bắt buộc!" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kiểm tra sân tồn tại
    const [existing] = await connection.execute("SELECT MaSan FROM tbl_san WHERE MaSan = ?", [MaSan]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy sân!" });
    }

    // Xóa toàn bộ đặt sân ngày liên quan (bảng này có FK tới tbl_san)
    await connection.execute("DELETE FROM tbl_datsan WHERE MaSan = ?", [MaSan]);

    // Xóa các đặt sân tháng có chứa mã sân này trong DanhSachSan
    await connection.execute(
      "DELETE FROM tbl_datsanthang WHERE FIND_IN_SET(?, REPLACE(DanhSachSan, ' ', '')) > 0",
      [MaSan]
    );

    // Cuối cùng xóa sân
    await connection.execute("DELETE FROM tbl_san WHERE MaSan = ?", [MaSan]);

    await connection.commit();

    res.json({ message: "✅ Đã xóa sân vĩnh viễn", MaSan, deleted: true });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // ignore rollback errors
      }
    }
    console.error("❌ Lỗi khi xóa sân:", err);
    res.status(500).json({ message: "Lỗi khi xóa sân", error: err.message });
  } finally {
    if (connection) connection.release();
  }
}

// Xóa toàn bộ lịch sử đặt sân (ngày và tháng)
export async function clearBookingHistory(req, res) {
  try {
    await db.execute("DELETE FROM tbl_datsan");
    await db.execute("DELETE FROM tbl_datsanthang");
    res.json({ message: "✅ Đã xóa toàn bộ lịch sử đặt sân (ngày + tháng)" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa lịch sử đặt sân:", err);
    res.status(500).json({ message: "Lỗi khi xóa lịch sử đặt sân", error: err.message });
  }
}

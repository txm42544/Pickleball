import { db } from "../../../config/db.js";

// Lấy danh sách ca làm theo tuần (nếu có)
export async function getAllCaLam(req, res) {
  const { week_start } = req.query;

  if (!week_start) {
    // Yêu cầu week_start để có thể JOIN đúng ca làm
    return res.status(400).json({ message: "Thiếu tham số 'week_start'!" });
  }

  try {
    // LEFT JOIN tbl_nhanvien (N) với tbl_calam (C) chỉ cho tuần đã chọn
    // THÊM GROUP BY để đảm bảo mỗi maNV chỉ hiện 1 lần
    const query = `
SELECT 
  N.maNV, 
  N.tenNV, 
  C.week_start, 
  COALESCE(C.t2, 'Nghỉ') AS t2, 
  COALESCE(C.t3, 'Nghỉ') AS t3, 
  COALESCE(C.t4, 'Nghỉ') AS t4, 
  COALESCE(C.t5, 'Nghỉ') AS t5, 
  COALESCE(C.t6, 'Nghỉ') AS t6, 
  COALESCE(C.t7, 'Nghỉ') AS t7, 
  COALESCE(C.cn, 'Nghỉ') AS cn, 
  COALESCE(C.status, 'Chưa duyệt') AS status
FROM tbl_nhanvien N
LEFT JOIN tbl_calam C 
  ON N.maNV = C.maNV AND C.week_start = ?
GROUP BY 
    N.maNV, N.tenNV, C.week_start, C.t2, C.t3, C.t4, C.t5, C.t6, C.t7, C.cn, C.status
ORDER BY N.maNV ASC
`.trim();

    const params = [week_start];

    const [rows] = await db.execute(query, params);

    // Dữ liệu đã được chuẩn hóa thành 'Nghỉ' ngay trong SQL (COALESCE)
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách ca làm:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách ca làm!" });
  }
}

// Thêm mới / Cập nhật ca làm (Upsert)
export async function upsertCaLam(req, res) {
  try {
    const { maNV, tenNV, week_start } = req.body;
    if (!maNV || !week_start)
      return res.status(400).json({ message: "Thiếu mã NV hoặc tuần bắt đầu!" });

    const [rows] = await db.execute(
      "SELECT * FROM tbl_calam WHERE maNV=? AND week_start=?",
      [maNV, week_start]
    );

    if (rows.length > 0) {
      const old = rows[0];
      // Merge dữ liệu mới với dữ liệu cũ
      await db.execute(
        `UPDATE tbl_calam SET
    tenNV=?,
    t2=?, t3=?, t4=?, t5=?, t6=?, t7=?, cn=?,
    status=?
  WHERE maNV=? AND week_start=?`,
        [
          tenNV || old.tenNV,
          req.body.t2 ?? old.t2,
          req.body.t3 ?? old.t3,
          req.body.t4 ?? old.t4,
          req.body.t5 ?? old.t5,
          req.body.t6 ?? old.t6,
          req.body.t7 ?? old.t7,
          req.body.cn ?? old.cn,
          req.body.status ?? old.status,
          maNV,
          week_start
        ]
      );
      return res.json({ message: "✅ Cập nhật ca làm thành công!" });
    }

    // Thêm mới
    await db.execute(
      `INSERT INTO tbl_calam
        (maNV, tenNV, week_start, t2, t3, t4, t5, t6, t7, cn, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maNV,
        tenNV,
        week_start,
        req.body.t2 || "Nghỉ",
        req.body.t3 || "Nghỉ",
        req.body.t4 || "Nghỉ",
        req.body.t5 || "Nghỉ",
        req.body.t6 || "Nghỉ",
        req.body.t7 || "Nghỉ",
        req.body.cn || "Nghỉ",
        req.body.status || "Chưa duyệt"
      ]
    );
    res.json({ message: "✅ Thêm ca làm thành công!" });

  } catch (err) {
    console.error("❌ Lỗi khi lưu ca làm:", err);
    res.status(500).json({ message: "Lỗi khi lưu ca làm!", error: err.message });
  }
}

export async function approveCaLam(req, res) {
  try {
    let { maNV, week_start } = req.body;

    // Chuẩn hóa ngày về dạng YYYY-MM-DD
    if (week_start && week_start.includes("T")) {
      week_start = week_start.split("T")[0];
    }

    const [result] = await db.execute(
      "UPDATE tbl_calam SET status = ? WHERE maNV = ? AND week_start = ?",
      ["Đã duyệt", maNV, week_start]
    );

    console.log("🟢 Duyệt:", maNV, week_start);
    console.log("🟢 Kết quả UPDATE:", result);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: `Không tìm thấy ca làm của nhân viên ${maNV} trong tuần ${week_start}!`,
      });
    }

    res.json({ message: "✅ Duyệt ca làm thành công!" });
  } catch (err) {
    console.error("❌ Lỗi khi duyệt ca làm:", err);
    res.status(500).json({ message: "Lỗi khi duyệt ca làm!", error: err.message });
  }
}



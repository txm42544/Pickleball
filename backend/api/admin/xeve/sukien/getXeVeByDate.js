import { db } from "../../../../config/db.js";

export async function getXeVeByDate(req, res) {
  try {
    const { date } = req.query;

    console.log("🔍 Toàn bộ query params:", req.query);
    console.log("📅 Giá trị nhận được của date:", date);

    if (!date) {
      return res.status(400).json({ message: "Thiếu tham số 'date' (yyyy-mm-dd)" });
    }

    // 👉 Tạo khoảng thời gian trong ngày theo múi giờ VN (+07:00)
    const startOfDay = new Date(`${date}T00:00:00+07:00`);
    const endOfDay = new Date(`${date}T23:59:59+07:00`);

    console.log("🕐 Khoảng thời gian tìm kiếm:", startOfDay, "->", endOfDay);

    // 👉 Truy vấn trong khoảng ngày thay vì so sánh chính xác (tránh sai múi giờ)
    const sql = `
      SELECT * 
      FROM tbl_xeve_sukien 
      WHERE NgayToChuc BETWEEN ? AND ?
    `;
    console.log("📜 SQL:", sql);

    const [rows] = await db.execute(sql, [startOfDay, endOfDay]);

    console.log("📦 Kết quả truy vấn:", rows.length, "sự kiện");

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không có sự kiện nào trong ngày này." });
    }

    // 👉 Chuyển đổi NgayToChuc sang múi giờ VN khi trả về
    const formattedRows = rows.map(row => ({
      ...row,
      NgayToChuc: new Date(row.NgayToChuc).toLocaleString("sv-SE", {
        timeZone: "Asia/Ho_Chi_Minh"
      })
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sự kiện theo ngày:", err);
    res.status(500).json({ message: "Lỗi máy chủ.", error: err.message });
  }
}

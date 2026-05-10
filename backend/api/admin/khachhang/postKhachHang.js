import { db } from "../../../config/db.js";

export async function postKhachHang(req, res) {
  try {
    const { MaKH, TenKh, SDT, DiaChi } = req.body;

    // 🧩 Kiểm tra dữ liệu đầu vào
    if (!MaKH || !TenKh || !SDT) {
      return res
        .status(400)
        .json({ message: "Thiếu mã khách hàng, tên hoặc số điện thoại" });
    }

    // 🧠 Thực thi truy vấn thêm khách hàng
    const [result] = await db.execute(
      "INSERT INTO tbl_khachhang (id, TenKh, SDT, DiaChi) VALUES (?, ?, ?, ?)",
      [MaKH, TenKh, SDT, DiaChi || ""]
    );

    // 🟢 Trả về phản hồi
    res.json({
      message: "✅ Thêm khách hàng thành công",
      insertedId: MaKH, // vì là VARCHAR nên trả về mã luôn
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm khách hàng:", err);
    res.status(500).json({
      message: "Lỗi khi thêm khách hàng",
      error: err.message,
    });
  }
}

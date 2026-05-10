import { db } from "../../../config/db.js";

export async function createNhaCungCap(req, res) {
  try {
    const { ten } = req.body;

    if (!ten) {
      return res.status(400).json({ error: "Tên nhà cung cấp không được để trống" });
    }

    const [result] = await db.execute("INSERT INTO nhacungcap (ten) VALUES (?)", [ten]);

    res.json({
      message: "✅ Thêm nhà cung cấp thành công!",
      data: { id: result.insertId, ten }
    });

  } catch (error) {
    console.error("❌ Lỗi thêm nhà cung cấp:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Nhà cung cấp đã tồn tại" });
    }

    res.status(500).json({ error: error.message });
  }
}
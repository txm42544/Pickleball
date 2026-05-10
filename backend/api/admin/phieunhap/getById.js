import { db } from "../../../config/db.js";

export async function getPhieuNhapById(req, res) {
  try {
    const { id } = req.params;

    // Lấy thông tin phiếu nhập
    const [phieuNhap] = await db.execute(
      `SELECT pn.*, ncc.ten as ten_nhacungcap 
       FROM phieunhap pn 
       JOIN nhacungcap ncc ON pn.nhacungcap_id = ncc.id 
       WHERE pn.id = ?`,
      [id]
    );

    if (phieuNhap.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy phiếu nhập" });
    }

    // Lấy chi tiết phiếu nhập
    const [chiTiet] = await db.execute(
      `SELECT ctpn.*, p.name as ten_sanpham, p.image_url
       FROM chitietphieunhap ctpn
       JOIN products p ON ctpn.product_id = p.id
       WHERE ctpn.phieunhap_id = ?`,
      [id]
    );

    res.json({
      message: "Lấy thông tin phiếu nhập thành công!",
      data: {
        ...phieuNhap[0],
        chitiet: chiTiet
      }
    });

  } catch (error) {
    console.error("❌ Lỗi lấy phiếu nhập theo ID:", error);
    res.status(500).json({ error: error.message });
  }
}
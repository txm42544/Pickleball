import { db } from "../../../config/db.js";

export async function createPhieuNhap(req, res) {
  console.log(" Bắt đầu tạo phiếu nhập...");

  try {
    const { maphieu, ngaynhap, nhacungcap_id, tongtien, ghichu, chitiet } = req.body;

    console.log(" Dữ liệu nhận được:", {
      maphieu, ngaynhap, nhacungcap_id, tongtien, ghichu,
      chitiet_count: chitiet?.length
    });

    // Validate dữ liệu
    if (!maphieu || !ngaynhap || !nhacungcap_id || tongtien === undefined || !chitiet || !Array.isArray(chitiet)) {
      return res.status(400).json({
        error: "Vui lòng điền đầy đủ thông tin: mã phiếu, ngày nhập, nhà cung cấp, chi tiết sản phẩm"
      });
    }

    if (chitiet.length === 0) {
      return res.status(400).json({ error: "Phiếu nhập phải có ít nhất 1 sản phẩm" });
    }

    // Lấy connection từ pool để thực hiện transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Tạo phiếu nhập
      console.log(" Đang tạo phiếu nhập...");
      const [phieuNhapResult] = await connection.execute(
        "INSERT INTO phieunhap (maphieu, ngaynhap, nhacungcap_id, tongtien, ghichu) VALUES (?, ?, ?, ?, ?)",
        [maphieu, ngaynhap, nhacungcap_id, parseFloat(tongtien), ghichu || ""]
      );

      const phieunhapId = phieuNhapResult.insertId;
      console.log(" Đã tạo phiếu nhập ID:", phieunhapId);

      // 2. Thêm chi tiết phiếu nhập và cập nhật tồn kho
      console.log(" Đang thêm chi tiết sản phẩm...");
      for (let i = 0; i < chitiet.length; i++) {
        const item = chitiet[i];
        console.log(` Thêm sản phẩm ${i + 1}:`, item);

        const productId = parseInt(item.product_id);
        const soluong = parseInt(item.soluong);
        const dongia = parseFloat(item.dongia) || 0;

        if (!productId || Number.isNaN(productId)) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: `Sản phẩm không hợp lệ ở vị trí ${i + 1}` });
        }

        if (!soluong || Number.isNaN(soluong) || soluong <= 0) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: `Số lượng không hợp lệ cho sản phẩm ${productId}` });
        }

        // Kiểm tra sản phẩm tồn tại
        const [found] = await connection.execute('SELECT id, name FROM products WHERE id = ?', [productId]);
        if (!found || found.length === 0) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: `Không tìm thấy sản phẩm ID ${productId}` });
        }

        console.log(` Tìm thấy sản phẩm: ${found[0].name}`);

        // Insert chi tiết
        await connection.execute(
          "INSERT INTO chitietphieunhap (phieunhap_id, product_id, soluong, dongia) VALUES (?, ?, ?, ?)",
          [phieunhapId, productId, soluong, dongia]
        );

        // Update stock
        await connection.execute(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          [soluong, productId]
        );

        console.log(`✅ Đã cập nhật tồn kho sản phẩm ID: ${productId} (+${soluong})`);
      }

      // Commit transaction
      await connection.commit();
      connection.release();
      console.log("🎉 Tạo phiếu nhập thành công!");

      res.json({
        message: " Tạo phiếu nhập thành công!",
        data: {
          id: phieunhapId,
          maphieu: maphieu
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error(" Lỗi trong quá trình tạo phiếu nhập:", error);
      throw error;
    }

  } catch (error) {
    console.error(" Lỗi tạo phiếu nhập:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Mã phiếu đã tồn tại" });
    }

    res.status(500).json({ error: error.message });
  }
}
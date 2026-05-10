import express from 'express';
import { db } from '../../../config/db.js';

const router = express.Router();

router.put('/:id/status', async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const { status: newStatus } = req.body;
    const { id: orderId } = req.params;

    if (!newStatus) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'Trạng thái mới là bắt buộc.' });
    }

    //  Lấy trạng thái hiện tại
    const [[currentOrder]] = await connection.query(
      'SELECT status FROM orders WHERE id = ? FOR UPDATE',
      [orderId]
    );

    if (!currentOrder) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    }

    const oldStatus = currentOrder.status;

    //  Các luồng trạng thái hợp lệ
    const allowedTransitions = {
      cho_xac_nhan: ['da_xac_nhan', 'da_huy'],
      da_xac_nhan: ['dang_giao', 'huy_sau_xac_nhan'],
      dang_giao: ['da_nhan', 'giao_that_bai'],
      da_nhan: ['doi_hang', 'tra_hang'],
      doi_hang: ['da_nhan', 'tra_hang'],
      tra_hang: ['hoan_tien'],
      hoan_tien: [],
      da_huy: [],
      huy_sau_xac_nhan: [],
      giao_that_bai: [],
    };



    const allowedNext = allowedTransitions[oldStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error: `Không thể chuyển từ trạng thái "${oldStatus}" sang "${newStatus}".`,
      });
    }

    //  Lấy sản phẩm trong đơn
    const [orderItems] = await connection.query(
      `SELECT oi.product_id, oi.quantity, p.name, p.stock
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    let stockMessages = [];

    //  Hàm xử lý kho
    const adjustStock = async (items, operation) => {
      for (const item of items) {
        const productId = parseInt(item.product_id, 10);
        if (isNaN(productId)) continue;

        const [[product]] = await connection.query(
          'SELECT stock, name FROM products WHERE id = ? FOR UPDATE',
          [productId]
        );

        if (!product) continue;

        if (operation === 'reduce') {
          if (product.stock < item.quantity) {
            throw new Error(
              `Không đủ hàng tồn kho cho sản phẩm "${product.name}". Chỉ còn ${product.stock} sản phẩm.`
            );
          }
          await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
            item.quantity,
            productId,
          ]);

          const newStock = product.stock - item.quantity;
          const msg = `🟠 Đã trừ ${item.quantity} sản phẩm "${product.name}" khỏi kho. Hiện còn ${newStock} sản phẩm "${product.name}".`;
          stockMessages.push(msg);
          console.log('[KHO]', msg);
        } else if (operation === 'return') {
          await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [
            item.quantity,
            productId,
          ]);

          const newStock = product.stock + item.quantity;
          const msg = ` Đã hoàn ${item.quantity} sản phẩm "${product.name}" vào kho. Hiện có ${newStock} sản phẩm "${product.name}".`;
          stockMessages.push(msg);
          console.log('[KHO]', msg);
        }
      }
    };

    //  Xác định logic trừ/hoàn kho
    const stockDeductedStatuses = ['da_xac_nhan', 'dang_giao', 'da_nhan'];
    const oldDeducted = stockDeductedStatuses.includes(oldStatus);
    const newDeducted = stockDeductedStatuses.includes(newStatus);

    if (oldDeducted && !newDeducted) {
      await adjustStock(orderItems, 'return');
    } else if (!oldDeducted && newDeducted) {
      await adjustStock(orderItems, 'reduce');
    }

    //  Cập nhật trạng thái
    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [
      newStatus,
      orderId,
    ]);

    await connection.commit();
    connection.release();
    return res.status(200).json({
      message: ' Cập nhật trạng thái đơn hàng thành công.',
      stockMessages,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Lỗi khi cập nhật trạng thái đơn hàng (Admin):', error);
    if (error.message.includes('Không đủ hàng tồn kho')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng.' });
  }
});

export default router;

import express from 'express';
import { db } from '../../../config/db.js';

const router = express.Router();

/**
 * Xóa đơn hàng và các sản phẩm liên quan trong order_items
 */
router.delete('/:id', async (req, res) => {
    const orderId = req.params.id;
    const connection = await db.getConnection();

    try {
        // Bắt đầu transaction
        await connection.beginTransaction();

        // 1️⃣ Kiểm tra đơn hàng có tồn tại không
        const [checkOrder] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (checkOrder.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần xóa.' });
        }

        // 2️⃣ Xóa các sản phẩm liên quan trong order_items
        await connection.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);

        // 3️⃣ Xóa đơn hàng chính
        await connection.query('DELETE FROM orders WHERE id = ?', [orderId]);

        // 4️⃣ Commit thay đổi
        await connection.commit();
        connection.release();

        res.json({ message: 'Đơn hàng và các sản phẩm liên quan đã được xóa thành công.' });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Lỗi khi xóa đơn hàng (Admin):', error);
        res.status(500).json({ error: 'Không thể xóa đơn hàng.' });
    }
});

export default router;

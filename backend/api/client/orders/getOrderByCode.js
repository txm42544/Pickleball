import express from 'express';
import { db } from '../../../config/db.js';
const router = express.Router();

router.get('/:orderCode', async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, kh.GioiTinh as customer_gender
            FROM orders o
            LEFT JOIN tbl_khachhang kh ON o.customer_id = kh.id
            WHERE o.order_code = ?
        `, [req.params.orderCode]);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        const order = orders[0];

        const [items] = await db.query(`
            SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.color, oi.product_name AS name, p.image_url
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [order.id]);

        res.json({ ...order, items });
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng theo mã:', error);
        res.status(500).json({ error: 'Không thể lấy thông tin đơn hàng' });
    }
});

export default router;
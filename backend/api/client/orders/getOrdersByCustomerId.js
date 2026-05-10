import express from 'express';
import { db } from '../../../config/db.js';
const router = express.Router();

router.get('/history', async (req, res) => {
    try {
        const { customerId } = req.query;

        if (!customerId) {
            return res.status(400).json({ message: 'Thiếu ID khách hàng.' });
        }

        const [orders] = await db.query(`
            SELECT o.*, kh.GioiTinh as customer_gender
            FROM orders o
            LEFT JOIN tbl_khachhang kh ON o.customer_id = kh.id
            WHERE o.customer_id = ?
            ORDER BY o.created_at DESC
        `, [customerId]);

        if (orders.length === 0) {
            return res.json([]);
        }

        // For each order, fetch its items
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const [items] = await db.query(`
                SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, oi.color, oi.product_name AS name, p.image_url
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            return { ...order, items };
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng của khách hàng:', error);
        res.status(500).json({ error: 'Không thể lấy lịch sử đơn hàng.' });
    }
});

export default router;
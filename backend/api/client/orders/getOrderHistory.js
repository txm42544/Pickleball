import express from 'express';
import { db } from '../../../config/db.js';

const router = express.Router();

router.get('/history', async (req, res) => {

    try {
        const [orders] = await db.query(
            'SELECT * FROM orders ORDER BY created_at DESC'
        );
        res.json(orders);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
        res.status(500).json({ error: 'Không thể lấy lịch sử đơn hàng.' });
    }
});

export default router;
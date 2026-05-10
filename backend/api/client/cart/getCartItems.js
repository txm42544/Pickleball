import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Get cart items for a session
router.get('/:sessionId', async (req, res) => {
    try {
        const [cartItems] = await db.query(
            `SELECT c.*, p.name, p.price, p.image_url, p.stock, p.colors as product_colors
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.session_id = ?`,
            [req.params.sessionId]
        );
        res.json(cartItems);
    } catch (error) {
        console.error('Lỗi khi lấy các mục trong giỏ hàng:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
});

export default router;
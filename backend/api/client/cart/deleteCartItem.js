import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Remove item from cart
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Lỗi khi xóa mục khỏi giỏ hàng:', error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

export default router;
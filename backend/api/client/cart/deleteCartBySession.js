import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Clear cart for a session
router.delete('/session/:sessionId', async (req, res) => {
    try {
        await db.query('DELETE FROM cart_items WHERE session_id = ?', [req.params.sessionId]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Lỗi khi xóa toàn bộ giỏ hàng:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

export default router;
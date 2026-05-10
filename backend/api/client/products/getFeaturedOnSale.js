import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Endpoint mới để lấy sản phẩm giảm giá nổi bật
router.get('/featured/on-sale', async (req, res) => {
    try {
        const [products] = await db.query(
            'SELECT * FROM products WHERE original_price IS NOT NULL AND price < original_price ORDER BY (original_price - price) DESC LIMIT 8'
        );
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch on-sale products' });
    }
});

export default router;
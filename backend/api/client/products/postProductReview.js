import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Add product review
router.post('/:id/reviews', async (req, res) => {
    try {
        const { rating, comment, author_name } = req.body;
        const productId = req.params.id;

        await db.query(
            'INSERT INTO reviews (product_id, rating, comment, author_name) VALUES (?, ?, ?, ?)',
            [productId, rating, comment, author_name]
        );

        // Update product rating and review count
        const [reviews] = await db.query('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?', [productId]);

        await db.query(
            'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
            [reviews[0].avg_rating, reviews[0].count, productId]
        );

        res.json({ message: 'Review added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

export default router;
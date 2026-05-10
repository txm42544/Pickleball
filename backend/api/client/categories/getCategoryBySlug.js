import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Get category by slug
router.get('/:slug', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);

        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(categories[0]);
    } catch (error) {
        console.error('Lỗi khi lấy danh mục theo slug:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

export default router;
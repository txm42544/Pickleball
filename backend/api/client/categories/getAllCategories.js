import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        console.error('Lỗi khi lấy tất cả danh mục:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;
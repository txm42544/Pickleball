import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Get new arrivals
router.get('/featured/new-arrivals', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE is_new = true ORDER BY created_at DESC LIMIT 8');
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch new arrivals' });
    }
});

export default router;
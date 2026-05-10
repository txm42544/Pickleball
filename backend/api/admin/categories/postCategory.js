import express from 'express';
import { db } from '../../../config/db.js';
import { categoryUpload } from '../middleware/upload.js'; // Import categoryUpload

const router = express.Router();

router.post('/', categoryUpload.single('image'), async (req, res) => {
    try {
        const { name, slug } = req.body;
        const imageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`
            : (req.body.image_url || null);

        const [result] = await db.query(
            'INSERT INTO categories (name, slug, image_url) VALUES (?, ?, ?)',
            [name, slug, imageUrl]
        );

        res.json({ message: 'Danh mục đã được tạo thành công', categoryId: result.insertId });
    } catch (error) {
        console.error('Lỗi khi tạo danh mục (Admin):', error);
        res.status(500).json({ error: 'Không thể tạo danh mục' });
    }
});

export default router;
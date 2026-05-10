import express from 'express';
import { db } from '../../../config/db.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.delete('/:id', async (req, res) => {
    try {
        const [category] = await db.query('SELECT image_url FROM categories WHERE id = ?', [req.params.id]);
        if (category.length > 0 && category[0].image_url) {
            try {
                const imageName = category[0].image_url.split('/').pop();
                const imagePath = path.join('uploads', 'categories', imageName);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Xóa file ảnh
                }
            } catch (e) {
                console.error("Lỗi khi xóa ảnh danh mục liên quan (Admin):", e);
            }
        }

        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Danh mục đã được xóa thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa danh mục (Admin):', error);
        res.status(500).json({ error: 'Không thể xóa danh mục' });
    }
});

export default router;
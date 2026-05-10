import express from 'express';
import { db } from '../../../config/db.js';
import { categoryUpload } from '../middleware/upload.js'; // Import categoryUpload
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.put('/:id', categoryUpload.single('image'), async (req, res) => {
    try {
        const { name, slug } = req.body;
        const { id } = req.params;
        let imageUrl = req.body.image_url;

        if (req.file) {
            const [oldCategory] = await db.query('SELECT image_url FROM categories WHERE id = ?', [id]);
            if (oldCategory.length > 0 && oldCategory[0].image_url) {
                try {
                    const oldImageName = oldCategory[0].image_url.split('/').pop();
                    const oldImagePath = path.join('uploads', 'categories', oldImageName);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath); // Xóa file ảnh cũ
                    }
                } catch (e) {
                    console.error("Lỗi khi xóa ảnh danh mục cũ (Admin):", e);
                }
            }

            imageUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;
        }

        await db.query(
            'UPDATE categories SET name = ?, slug = ?, image_url = ? WHERE id = ?',
            [name, slug, imageUrl, id]
        );

        res.json({ message: 'Danh mục đã được cập nhật thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật danh mục (Admin):', error);
        res.status(500).json({ error: 'Không thể cập nhật danh mục' });
    }
});

export default router;
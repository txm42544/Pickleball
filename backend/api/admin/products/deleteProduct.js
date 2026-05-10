import express from 'express';
import { db } from '../../../config/db.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.delete('/:id', async (req, res) => {
    try {
        // Optionally, delete the associated image file
        const [product] = await db.query('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
        if (product.length > 0 && product[0].image_url) {
            try {
                const imageName = product[0].image_url.split('/').pop();
                const imagePath = path.join('uploads', 'products', imageName);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Delete the image file
                }
            } catch (e) {
                console.error("Lỗi khi xóa ảnh sản phẩm liên quan (Admin):", e);
            }
        }

        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Sản phẩm đã được xóa thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm (Admin):', error);
        res.status(500).json({ error: 'Không thể xóa sản phẩm' });
    }
});

export default router;
import express from 'express';
import { db } from '../../../config/db.js';
import { productUpload } from '../middleware/upload.js'; // Import productUpload
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.put('/:id', productUpload.single('image'), async (req, res) => {
    try {
        const { name, description, price, original_price, category, colors, stock, is_new, discount_percent } = req.body;
        let imageUrl = req.body.image_url;

        if (req.file) {
            const [oldProduct] = await db.query('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
            if (oldProduct.length > 0 && oldProduct[0].image_url) {
                try {
                    const oldImageName = oldProduct[0].image_url.split('/').pop();
                    const oldImagePath = path.join('uploads', 'products', oldImageName);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (e) {
                    console.error("Lỗi khi xóa ảnh sản phẩm cũ (Admin):", e);
                }
            }
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
        }

        const productData = {
            name,
            description,
            price,
            original_price: original_price || null,
            category,
            image_url: imageUrl,
            colors: colors || '[]',
            stock,
            is_new: is_new === 'true' || is_new === true ? 1 : 0,
            discount_percent: discount_percent || null
        };

        await db.query(
            'UPDATE products SET ? WHERE id = ?',
            [productData, req.params.id]
        );

        res.json({ message: 'Sản phẩm đã được cập nhật thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm (Admin):', error);
        res.status(500).json({ error: 'Không thể cập nhật sản phẩm' });
    }
});

export default router;
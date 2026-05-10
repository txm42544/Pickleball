import express from 'express';
import { db } from '../../../config/db.js';
import { productUpload } from '../middleware/upload.js'; // Import productUpload

const router = express.Router();

router.post('/', productUpload.single('image'), async (req, res) => {
    try {
        const { name, description, price, original_price, category, colors, stock, is_new, discount_percent } = req.body;

        const imageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`
            : (req.body.image_url || null);

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

        const [result] = await db.query('INSERT INTO products SET ?', [productData]);

        res.json({ message: 'Sản phẩm đã được tạo thành công', productId: result.insertId });
    } catch (error) {
        console.error('Lỗi khi tạo sản phẩm (Admin):', error);
        res.status(500).json({ error: 'Không thể tạo sản phẩm' });
    }
});

export default router;
import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Update cart item quantity
router.put('/:id', async (req, res) => {
    await db.beginTransaction(); // Bắt đầu giao dịch
    try {
        const { quantity: newQuantity } = req.body;
        const cartItemId = req.params.id;

        // Lấy thông tin sản phẩm và khóa hàng để tránh race condition
        const [[cartItem]] = await db.query(
            'SELECT ci.product_id, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? FOR UPDATE',
            [cartItemId]
        );

        if (!cartItem) {
            await db.rollback();
            return res.status(404).json({ error: 'Sản phẩm trong giỏ hàng không tồn tại.' });
        }

        if (newQuantity <= 0) {
            await db.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
        } else {
            if (cartItem.stock < newQuantity) {
                await db.rollback();
                return res.status(400).json({ error: `Không đủ hàng tồn kho. Chỉ còn ${cartItem.stock} sản phẩm.` });
            }
            await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, cartItemId]);
        }

        await db.commit(); // Hoàn tất giao dịch
        res.json({ message: 'Cart updated' });
    } catch (error) {
        await db.rollback(); // Hoàn tác nếu có lỗi
        console.error('Lỗi khi cập nhật giỏ hàng:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

export default router;
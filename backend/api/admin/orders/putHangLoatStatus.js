import express from 'express';
import { db } from '../../../config/db.js';

const router = express.Router();

router.put('/hangloat/status', async (req, res) => {
    const { orderIds, status: newStatus } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0)
        return res.status(400).json({ error: 'Danh sách đơn hàng không hợp lệ.' });

    if (!newStatus)
        return res.status(400).json({ error: 'Trạng thái mới là bắt buộc.' });

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const allowedTransitions = {
            cho_xac_nhan: ['da_xac_nhan', 'da_huy'],
            da_xac_nhan: ['dang_giao', 'huy_sau_xac_nhan'],
            dang_giao: ['da_nhan', 'giao_that_bai'],
            da_nhan: ['doi_hang', 'tra_hang'],
            doi_hang: ['da_nhan', 'tra_hang'],
            tra_hang: ['hoan_tien'],
            hoan_tien: [],
            da_huy: [],
            huy_sau_xac_nhan: [],
            giao_that_bai: [],
        };

        // 1. Lấy tất cả đơn hàng
        const [allSelectedOrders] = await connection.query(
            'SELECT id, status, order_code FROM orders WHERE id IN (?) FOR UPDATE',
            [orderIds]
        );

        const validOrders = [];
        const invalidOrders = [];
        const stockMessages = []; // 🟢 thêm mảng lưu thông báo kho

        for (const order of allSelectedOrders) {
            const allowedNext = allowedTransitions[order.status] || [];
            if (allowedNext.includes(newStatus)) {
                validOrders.push(order);
            } else {
                invalidOrders.push({
                    order_code: order.order_code,
                    reason: `Không thể chuyển từ "${order.status}" sang "${newStatus}".`
                });
            }
        }

        if (validOrders.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                error: 'Không có đơn hàng nào hợp lệ để cập nhật.',
                invalidOrders,
            });
        }

        const validOrderIds = validOrders.map(o => o.id);

        // 2. Lấy danh sách sản phẩm trong đơn
        const [orderItems] = await connection.query(
            `SELECT oi.order_id, oi.product_id, oi.quantity, p.name
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id IN (?)`,
            [validOrderIds]
        );

        const productIds = [...new Set(orderItems.map(item => item.product_id))];
        const [products] = productIds.length > 0 ? await connection.query(
            'SELECT id, name, stock FROM products WHERE id IN (?) FOR UPDATE',
            [productIds]
        ) : [[]];

        const productMap = new Map(products.map(p => [p.id, p]));
        const stockUpdates = new Map();

        // 3. Xử lý trừ / hoàn kho
        for (const order of validOrders) {
            const oldStatus = order.status;
            const itemsForThisOrder = orderItems.filter(item => item.order_id === order.id);

            const stockDeductedStatuses = ['da_xac_nhan', 'dang_giao', 'da_nhan'];
            const oldDeducted = stockDeductedStatuses.includes(oldStatus);
            const newDeducted = stockDeductedStatuses.includes(newStatus);

            if (oldDeducted === newDeducted) continue;

            for (const item of itemsForThisOrder) {
                const product = productMap.get(item.product_id);
                if (!product) continue;

                const currentStock = product.stock;
                const stockChange = stockUpdates.get(item.product_id) || 0;

                if (!oldDeducted && newDeducted) {
                    // 🟢 Trừ kho
                    if (currentStock + stockChange < item.quantity) {
                        throw new Error(`Không đủ hàng tồn kho cho "${item.name}". Chỉ còn ${currentStock}.`);
                    }
                    stockUpdates.set(item.product_id, stockChange - item.quantity);
                    stockMessages.push(`Đã trừ ${item.quantity} sản phẩm "${item.name}" khỏi kho.`);
                } else {
                    // 🟢 Hoàn kho
                    stockUpdates.set(item.product_id, stockChange + item.quantity);
                    stockMessages.push(`Đã hoàn ${item.quantity} sản phẩm "${item.name}" vào kho.`);
                }
            }
        }

        // 4. Cập nhật DB
        for (const [productId, change] of stockUpdates.entries()) {
            if (change === 0) continue;
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [change, productId]
            );
        }

        await connection.query(
            'UPDATE orders SET status = ? WHERE id IN (?)',
            [newStatus, validOrderIds]
        );

        await connection.commit();
        connection.release();

        res.json({
            message: `✅ Cập nhật ${validOrders.length} đơn hàng thành công.`,
            skippedCount: invalidOrders.length,
            invalidOrders,
            stockMessages, // 🟢 Trả về cho frontend
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Lỗi khi cập nhật hangloat status:', error);
        res.status(400).json({ error: error.message });
    }
});

export default router;

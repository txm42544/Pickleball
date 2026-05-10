import express from 'express';
import { db } from '../../../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { page, limit, search = '' } = req.query; // Không đặt giá trị mặc định cho 'page' và 'limit' ở đây
        const searchPattern = `%${search}%`;

        // Xác định xem có nên áp dụng phân trang hay không
        const applyPagination = limit !== undefined;

        let offset = 0;
        let parsedLimit = 0;

        if (applyPagination) {
            parsedLimit = parseInt(limit) || 10;
            const parsedPage = parseInt(page) || 1;
            offset = (parsedPage - 1) * parsedLimit;
        }

        const countParams = [];
        let countQuery = 'SELECT COUNT(*) as totalCount FROM products WHERE 1=1';
        if (search) {
            countQuery += ' AND (name LIKE ? OR description LIKE ?)';
            countParams.push(searchPattern, searchPattern);
        }

        const [totalResult] = await db.query(countQuery, countParams);
        const totalCount = totalResult[0].totalCount;

        const params = [];
        let query = 'SELECT * FROM products WHERE 1=1';
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(searchPattern, searchPattern);
        }
        query += ' ORDER BY created_at DESC';

        if (applyPagination) {
            query += ' LIMIT ? OFFSET ?';
            params.push(parsedLimit, offset);
        }

        const [products] = await db.query(query, params);
        res.json({ products, totalCount });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm (Admin):', error);
        res.status(500).json({ error: 'Không thể lấy danh sách sản phẩm' });
    }
});

export default router;
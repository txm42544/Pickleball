import express from 'express';
import { db } from '../../../config/db.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 8, search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const searchPattern = `%${search}%`;

        const countParams = [];
        let countQuery = 'SELECT COUNT(*) as totalCount FROM categories WHERE 1=1';
        if (search) {
            countQuery += ' AND (name LIKE ? OR slug LIKE ?)';
            countParams.push(searchPattern, searchPattern);
        }

        const [totalResult] = await db.query(countQuery, countParams);
        const totalCount = totalResult[0].totalCount;

        const params = [];
        let query = 'SELECT * FROM categories WHERE 1=1';
        if (search) {
            query += ' AND (name LIKE ? OR slug LIKE ?)';
            params.push(searchPattern, searchPattern);
        }
        query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [categories] = await db.query(query, params);
        res.json({ categories, totalCount });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục (Admin):', error);
        res.status(500).json({ error: 'Không thể lấy danh sách danh mục' });
    }
});

// Endpoint để lấy danh sách các file ảnh đã upload cho categories
router.get('/uploads', async (req, res) => {
    try {
        const dir = path.join(process.cwd(), 'uploads', 'categories');
        if (!fs.existsSync(dir)) return res.json([]);
        const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
        const list = files.map(filename => ({
            filename,
            url: `${req.protocol}://${req.get('host')}/uploads/categories/${encodeURIComponent(filename)}`
        }));
        res.json(list);
    } catch (error) {
        console.error('Lỗi khi đọc danh sách tải lên (Admin Categories):', error);
        res.status(500).json({ error: 'Không thể liệt kê các file đã tải lên' });
    }
});

export default router;
import express from 'express';
import productsRouter from './products/index.js';
import ordersRouter from './orders/index.js';
import categoriesRouter from './categories/index.js';
import khachhangRouter from './khachhang/index.js';
import nhacungcapRouter from './nhacungcap/index.js';
import phieunhapRouter from './phieunhap/index.js';
import sanRouter from './san/index.js';
import santhangRouter from './santhang/index.js';
import taikhoanRouter from './taikhoan/index.js';
import notificationsRouter from './notifications/index.js';

const router = express.Router();

// Use sub-routers for different admin functionalities
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/categories', categoriesRouter);
router.use('/khachhang', khachhangRouter);
router.use('/nhacungcap', nhacungcapRouter);
router.use('/phieunhap', phieunhapRouter);
router.use('/san', sanRouter);
router.use('/santhang', santhangRouter);
router.use('/taikhoan', taikhoanRouter);
router.use('/notifications', notificationsRouter);

export default router;
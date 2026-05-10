import express from 'express';
import productsRouter from './products/index.js';
import cartRouter from './cart/index.js';
import categoriesRouter from './categories/index.js';
import ordersRouter from './orders/index.js'
import notificationsRouter from './notifications/index.js';
const router = express.Router();

// Use sub-routers for different admin functionalities
router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/categories', categoriesRouter);
router.use('/orders', ordersRouter);
router.use('/notifications', notificationsRouter);
export default router;
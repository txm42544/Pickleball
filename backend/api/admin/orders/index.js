import express from 'express';
import getAllOrdersRouter from './getAllOrders.js';
import putOrderStatusRouter from './putOrderStatus.js';
import deleteOrderRouter from './deleteOrder.js';
import putHangLoatStatus from './putHangLoatStatus.js';
const router = express.Router();

router.use('/', getAllOrdersRouter);
router.use('/', putHangLoatStatus);
router.use('/', putOrderStatusRouter);
router.use('/', deleteOrderRouter); // 
export default router;

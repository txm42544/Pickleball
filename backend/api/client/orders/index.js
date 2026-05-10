import express from 'express';
import postOrderRouter from './postOrder.js';
import getOrderByCodeRouter from './getOrderByCode.js';
import getOrderHistoryRouter from './getOrderHistory.js';
import getOrdersByCustomerIdRouter from './getOrdersByCustomerId.js'; 

const router = express.Router();

router.use('/', postOrderRouter); 
router.use('/', getOrdersByCustomerIdRouter); 
router.use('/', getOrderByCodeRouter); 

router.use('/', getOrderHistoryRouter);

export default router;
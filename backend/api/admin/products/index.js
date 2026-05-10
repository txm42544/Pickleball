import express from 'express';
import getAllProductsRouter from './getAllProducts.js';
import postProductRouter from './postProduct.js';
import putProductRouter from './putProduct.js';
import deleteProductRouter from './deleteProduct.js';

const router = express.Router();

router.use('/', getAllProductsRouter);
router.use('/', postProductRouter);
router.use('/', putProductRouter);
router.use('/', deleteProductRouter);

export default router;
import express from "express";

import adminRouter from './admin/index.js';
import customersRouter from './client/index.js';

const router = express.Router();

router.use('/admin', adminRouter);
router.use('/client', customersRouter);


export default router;

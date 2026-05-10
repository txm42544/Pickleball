import express from 'express';
import getAllCategoriesRouter from './getAllCategories.js';
import postCategoryRouter from './postCategory.js';
import putCategoryRouter from './putCategory.js';
import deleteCategoryRouter from './deleteCategory.js';

const router = express.Router();

router.use('/', getAllCategoriesRouter);
router.use('/', postCategoryRouter);
router.use('/', putCategoryRouter);
router.use('/', deleteCategoryRouter);

export default router;
import express from 'express';
import getAllCategoriesRouter from './getAllCategories.js';
import getCategoryBySlugRouter from './getCategoryBySlug.js';

const router = express.Router();

// Use individual routers
router.use('/', getAllCategoriesRouter); // Handles GET /
router.use('/', getCategoryBySlugRouter); // Handles GET /:slug

export default router;
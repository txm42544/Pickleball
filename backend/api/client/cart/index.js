import express from 'express';
import getCartItemsRouter from './getCartItems.js';
import postCartItemRouter from './postCartItem.js';
import putCartItemRouter from './putCartItem.js';
import deleteCartItemRouter from './deleteCartItem.js';
import deleteCartBySessionRouter from './deleteCartBySession.js';

const router = express.Router();

// Use individual routers
router.use('/', getCartItemsRouter); // Handles GET /:sessionId
router.use('/', postCartItemRouter); // Handles POST /
router.use('/', putCartItemRouter); // Handles PUT /:id
router.use('/', deleteCartItemRouter); // Handles DELETE /:id
router.use('/', deleteCartBySessionRouter); // Handles DELETE /session/:sessionId

export default router;
import express from 'express';
import { getWishlist, toggleWishlistItem } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/:productId', toggleWishlistItem); // Acts as toggle (add/remove)

export default router;

import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { requireSelling } from '../middleware/requireSelling.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/', requireSelling, addToCart);
router.put('/', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:productId', removeFromCart);

export default router;

import { Router } from 'express';
import { priceCart, mockPayment } from '../controllers/payments.controller.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();

router.post('/mock', requireAuth, mockPayment);
router.post('/price', priceCart);

export default router;

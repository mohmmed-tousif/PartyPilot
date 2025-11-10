import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upsertCustomerProfile, me } from '../controllers/profile.controller.js';

const router = Router();
router.get('/me', requireAuth, me);
router.post('/customer', requireAuth, upsertCustomerProfile);

export default router;

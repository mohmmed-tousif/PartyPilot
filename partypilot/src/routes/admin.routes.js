import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { listVendors, listCustomers, revenue, createBulletin, listBulletins } from '../controllers/admin.controller.js';

const router = Router();

router.get('/vendors', requireAuth, requireRole('admin'), listVendors);
router.get('/customers', requireAuth, requireRole('admin'), listCustomers);
router.get('/revenue', requireAuth, requireRole('admin'), revenue);
router.post('/bulletins', requireAuth, requireRole('admin'), createBulletin);
router.get('/bulletins', requireAuth, requireRole('admin'), listBulletins);

export default router;

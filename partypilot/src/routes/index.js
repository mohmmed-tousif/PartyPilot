/**
 * API router mount; placeholder in this phase.
 * Future: /auth, /profile, /packages, /orders, /payments, /admin
 */
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import orderRoutes from './orders.routes.js';
import packageRoutes from './packages.routes.js';
import profileRoutes from './profile.routes.js';
import adminRoutes from './admin.routes.js';
import paymentRoutes from './payments.routes.js';

const router = Router();

// Simple ping for API base
router.get('/ping', (_req, res) => {
  res.json({ ok: true, message: 'pong' });
});
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
 router.use('/packages', packageRoutes);
router.use('/profile', profileRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
export default router;

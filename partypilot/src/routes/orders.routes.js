import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createOrderController,
  customerOrdersController,
  partnerIncomingController,
  acceptOrderController
} from '../controllers/orders.controller.js';

import { updateStatusController } from '../controllers/orders.controller.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createOrderRules } from '../validators/orders.validators.js';


const router = Router();

router.post('/', requireAuth, createOrderController);
router.get('/my', requireAuth, customerOrdersController);
router.get('/partner/incoming', requireAuth, partnerIncomingController);
router.post('/:id/accept', requireAuth, acceptOrderController);
router.post('/:id/status', requireAuth, updateStatusController);
router.post('/', requireAuth, validate(createOrderRules), createOrderController);

export default router;

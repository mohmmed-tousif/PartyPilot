import { Router } from 'express';
import { requestCustomerOtp, verifyCustomerOtp/*, partnerAdminLogin */} from '../controllers/auth.controller.js';

const router = Router();

router.post('/customer/request-otp', requestCustomerOtp);
router.post('/customer/verify-otp', verifyCustomerOtp);

// Partner
router.post('/partner/login', (req, res, next) => {
  req.body.role = 'partner';
  partnerAdminLogin(req, res, next);
});

// Admin
router.post('/admin/login', (req, res, next) =>
  partnerAdminLogin({ ...req, body: { ...req.body, role: 'admin' } }, res, next)
);

export default router;

// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  registerCustomer, 
  verifyCustomerOTP,
  updateCustomerProfile,
  registerPartner,
  loginPartner,
  loginAdmin
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Customer Routes ---
router.post('/customer/register', registerCustomer);
router.post('/customer/verify', verifyCustomerOTP);
router.put('/customer/profile', protect, updateCustomerProfile);

// --- Partner Routes ---
router.post('/partner/register', registerPartner);
router.post('/partner/login', loginPartner);

// --- Admin Routes ---
router.post('/admin/login', loginAdmin);

module.exports = router;
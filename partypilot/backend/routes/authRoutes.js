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
const { protect } = require('../middleware/authMiddleware');
const { customer } = require('../middleware/roleMiddleware');

// --- Customer Routes ---
router.post('/customer/register', registerCustomer);
router.post('/customer/verify', verifyCustomerOTP);
router.put('/customer/profile', protect, updateCustomerProfile);
router.get('/customer/profile', protect, customer, require('../controllers/authController').getCustomerProfile);

// Favorites
router.get('/customer/favorites', protect, customer, require('../controllers/authController').getFavorites);
router.post('/customer/favorites/:id', protect, customer, require('../controllers/authController').addFavorite);
router.delete('/customer/favorites/:id', protect, customer, require('../controllers/authController').removeFavorite);

// --- Partner Routes ---
router.post('/partner/register', registerPartner);
router.post('/partner/login', loginPartner);

// --- Admin Routes ---
router.post('/admin/login', loginAdmin);

module.exports = router;
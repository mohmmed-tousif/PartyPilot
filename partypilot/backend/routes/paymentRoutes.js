// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createStripePaymentIntent,
  confirmStripePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentHistory,
  stripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Stripe routes
router.post('/stripe/create-intent', protect, createStripePaymentIntent);
router.post('/stripe/confirm', protect, confirmStripePayment);

// Razorpay routes
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Payment history
router.get('/history', protect, getPaymentHistory);

// Webhook (no auth required - verified by signature)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;

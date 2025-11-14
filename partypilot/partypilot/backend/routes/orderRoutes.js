// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { customer } = require('../middleware/roleMiddleware');

// Public route to get packages (needed for customer to browse)
const { getPackages } = require('../controllers/adminController');
router.get('/packages', getPackages);

router.route('/')
  .post(protect, customer, createOrder); // Only customers can create orders

router.route('/myorders')
  .get(protect, customer, getMyOrders); // Only customers get *their* orders

router.route('/:id')
  .get(protect, getOrderById); // Customer, Partner, or Admin can get order

module.exports = router;
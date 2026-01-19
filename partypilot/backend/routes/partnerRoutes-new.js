// backend/routes/partnerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getNewOrders,
  getMyAssignedOrders,
  acceptOrder,
  updateOrderStatus,
  updateLocation
} = require('../controllers/partnerController');
const { protect } = require('../middleware/authMiddleware');
const { partner } = require('../middleware/roleMiddleware');

// All partner routes are protected and require the 'partner' role
router.use(protect, partner);

router.get('/orders/new', getNewOrders);
router.get('/orders/my', getMyAssignedOrders);
router.put('/orders/:id/accept', acceptOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/location', updateLocation); // New location update endpoint

module.exports = router;

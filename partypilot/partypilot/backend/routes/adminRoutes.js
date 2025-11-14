// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
  getPartners,
  approvePartner,
  getAllOrders
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// All admin routes are protected and require the 'admin' role
router.use(protect, admin);

// Package routes
router.route('/packages')
  .post(createPackage)
  .get(getPackages);
router.route('/packages/:id')
  .put(updatePackage)
  .delete(deletePackage);

// Partner routes
router.route('/partners')
  .get(getPartners);
router.route('/partners/:id/approve')
  .put(approvePartner);

// Order routes
router.route('/orders')
  .get(getAllOrders);

module.exports = router;
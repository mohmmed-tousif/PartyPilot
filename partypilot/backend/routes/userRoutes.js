// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserOrders,
  getUserStats,
  deleteUserAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../utils/cloudinaryUpload');

// All routes are protected
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', uploadSingle, updateUserProfile);
router.put('/password', changePassword);
router.get('/orders', getUserOrders);
router.get('/stats', getUserStats);
router.delete('/account', deleteUserAccount);

module.exports = router;

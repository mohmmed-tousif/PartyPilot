// backend/controllers/userController.js
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update allowed fields
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.address) user.address = req.body.address;
    if (req.body.city) user.city = req.body.city;
    if (req.body.state) user.state = req.body.state;
    if (req.body.zipCode) user.zipCode = req.body.zipCode;
    
    // Handle profile picture upload
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file);
      user.profilePicture = imageUrl;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      phone: updatedUser.phone,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      zipCode: updatedUser.zipCode,
      profilePicture: updatedUser.profilePicture,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user order history
// @route   GET /api/users/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    const query = { customer: req.user.id };
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('package', 'name image images price')
      .populate('assignedPartner', 'companyName phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Order.aggregate([
      { $match: { customer: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSpent: { $sum: '$paymentAmount' }
        }
      }
    ]);
    
    const totalOrders = await Order.countDocuments({ customer: userId });
    const completedOrders = await Order.countDocuments({ customer: userId, status: 'Picked Up' });
    const activeOrders = await Order.countDocuments({ 
      customer: userId, 
      status: { $in: ['Received', 'Accepted', 'Partner Reached', 'Setup Complete', 'Ready for Pickup'] }
    });
    
    const totalSpent = await Order.aggregate([
      { $match: { customer: mongoose.Types.ObjectId(userId), paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
    ]);
    
    res.json({
      totalOrders,
      completedOrders,
      activeOrders,
      totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteUserAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Please provide your password to confirm deletion' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    
    // Check for active orders
    const activeOrders = await Order.countDocuments({
      customer: user._id,
      status: { $in: ['Received', 'Accepted', 'Partner Reached', 'Setup Complete', 'Ready for Pickup'] }
    });
    
    if (activeOrders > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete account with active orders. Please complete or cancel them first.' 
      });
    }
    
    await user.deleteOne();
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: error.message });
  }
};

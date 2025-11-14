// backend/controllers/orderController.js
const Order = require('../models/Order');
const Package = require('../models/Package');
const User = require('../models/User');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  const { packageId, eventDate, address, paymentType, paymentAmount } = req.body;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Check if user profile is complete
    const customer = await User.findById(req.user.id);
    if (!customer.fullName || !customer.address) {
       // Use order address to update profile if empty
       customer.address = address;
       await customer.save();
    }

    const order = new Order({
      customer: req.user.id,
      package: packageId,
      eventDate,
      address,
      paymentType,
      paymentAmount
    });

    const createdOrder = await order.save();
    
    // Emit event to admin
    req.io.to('adminRoom').emit('newOrder', createdOrder);
    
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for the logged-in customer
// @route   GET /api/orders/myorders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('package', 'name image')
      .populate('assignedPartner', 'companyName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'fullName phone')
      .populate('package');

    if (order) {
      // Add authorization check (is it my order? or am I admin/partner?)
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// backend/controllers/orderController.js
const Order = require('../models/Order');
const Package = require('../models/Package');
const User = require('../models/User');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/emailService');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  const { packageId, eventDate, address, paymentType, paymentAmount } = req.body;

  console.log('Creating order with data:', { packageId, eventDate, address, paymentType, paymentAmount, userId: req.user.id });

  // Validation
  if (!packageId || !eventDate || !address || !paymentType || !paymentAmount) {
    console.error('Missing required fields');
    return res.status(400).json({ message: 'All fields are required: packageId, eventDate, address, paymentType, paymentAmount' });
  }

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      console.error('Package not found:', packageId);
      return res.status(404).json({ message: 'Package not found' });
    }
    
    console.log('Package found:', pkg.name);
    
    // Check if user profile is complete
    const customer = await User.findById(req.user.id);
    if (!customer) {
      console.error('Customer not found:', req.user.id);
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    console.log('Customer found:', customer.phone);
    
    if (!customer.fullName || !customer.address) {
       // Use order address to update profile if empty
       customer.address = address;
       customer.fullName = customer.fullName || 'Customer';
       await customer.save();
       console.log('Updated customer profile');
    }

    const order = new Order({
      customer: req.user.id,
      package: packageId,
      eventDate: new Date(eventDate),
      address,
      paymentType,
      paymentAmount
    });

    const createdOrder = await order.save();
    console.log('Order created successfully:', createdOrder._id);
    
    // Populate for email
    await createdOrder.populate('package');
    
    // Send confirmation email
    try {
      await sendOrderConfirmation(createdOrder, customer);
      console.log('Confirmation email sent');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }
    
    // Emit event to admin
    try {
      req.io.to('adminRoom').emit('newOrder', createdOrder);
      console.log('Emitted newOrder event to admin');
    } catch (ioError) {
      console.error('Failed to emit socket event:', ioError);
    }
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
};

// @desc    Get orders for the logged-in customer
// @route   GET /api/orders/myorders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('package', 'name image images')
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
      // Authorization: customer can access own orders, assigned partner can access, admin can access
      const requester = req.user;

      // Admin token user may be a plain decoded object with role = 'admin'
      if (requester && requester.role === 'admin') {
        return res.json(order);
      }

      // If the requester is the customer who placed the order
      if (requester && requester.role === 'customer' && order.customer && order.customer._id.toString() === requester._id.toString()) {
        return res.json(order);
      }

      // If the requester is partner and assigned to this order
      if (requester && requester.role === 'partner' && order.assignedPartner && order.assignedPartner.toString() === requester._id.toString()) {
        return res.json(order);
      }

      // Otherwise not authorized
      return res.status(401).json({ message: 'Not authorized to view this order' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// backend/controllers/partnerController.js
const Order = require('../models/Order');

// @desc    Get new (unassigned) orders
// @route   GET /api/partner/orders/new
// @access  Private (Partner)
exports.getNewOrders = async (req, res) => {
  try {
    // Find orders that are 'Received' and not yet assigned
    const orders = await Order.find({ status: 'Received', assignedPartner: null })
      .populate('package', 'name price')
      .populate('customer', 'fullName address')
      .sort({ eventDate: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders assigned to the logged-in partner
// @route   GET /api/partner/orders/my
// @access  Private (Partner)
exports.getMyAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ assignedPartner: req.user.id })
      .populate('package', 'name')
      .populate('customer', 'fullName address phone')
      .sort({ eventDate: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Accept or Decline an order
// @route   PUT /api/partner/orders/:id/accept
// @access  Private (Partner)
exports.acceptOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if order is still 'Received' and unassigned
        if (order.status !== 'Received' || order.assignedPartner) {
            return res.status(400).json({ message: 'Order already taken' });
        }

        order.assignedPartner = req.user.id;
        order.status = 'Accepted';
        
        const updatedOrder = await order.save();
        
        // Notify customer
        req.io.to(order.customer.toString()).emit('orderStatusChanged', {
            orderId: order._id,
            newStatus: 'Accepted',
            partner: req.user.companyName
        });

        // Notify admin
        req.io.to('adminRoom').emit('orderUpdated', updatedOrder);
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/partner/orders/:id/status
// @access  Private (Partner)
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Partner Reached', 'Setup Complete', 'Ready for Pickup', 'Picked Up'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if this partner is assigned to this order
    if (order.assignedPartner.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized for this order' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Notify customer
    req.io.to(order.customer.toString()).emit('orderStatusChanged', {
      orderId: order._id,
      newStatus: order.status
    });

    // Notify admin
    req.io.to('adminRoom').emit('orderUpdated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
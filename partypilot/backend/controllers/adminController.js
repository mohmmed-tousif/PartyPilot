// backend/controllers/adminController.js
const Package = require('../models/Package');
const Partner = require('../models/Partner');
const Order = require('../models/Order');

// --- Package Management ---
exports.createPackage = async (req, res) => {
  const { name, description, price, features, image, images } = req.body;
  try {
    // If images array is provided, use it; otherwise use single image
    const imageData = images && images.length > 0 ? { images } : { image: image || 'https://via.placeholder.com/400x300' };
    const pkg = new Package({ name, description, price, features, ...imageData });
    const createdPackage = await pkg.save();
    res.status(201).json(createdPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPackages = async (req, res) => {
  try {
    // Filtering / search support
    const { q, category, minPrice, maxPrice, tag, sortBy, page = 1, limit = 50, active } = req.query;
    const filter = {};

    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (active !== undefined) filter.isActive = active === 'true';

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    let sort = { createdAt: -1 };
    if (sortBy === 'priceAsc') sort = { price: 1 };
    if (sortBy === 'priceDesc') sort = { price: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };

    const packages = await Package.find(filter).sort(sort).skip(skip).limit(Number(limit));
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  const { name, description, price, features, image, images, isActive } = req.body;
  try {
    const pkg = await Package.findById(req.params.id);
    if (pkg) {
      pkg.name = name || pkg.name;
      pkg.description = description || pkg.description;
      pkg.price = price || pkg.price;
      pkg.features = features || pkg.features;
      
      // Handle images: if images array is provided, use it; otherwise update single image
      if (images && Array.isArray(images) && images.length > 0) {
        pkg.images = images;
        // Keep image field for backward compatibility (use first image)
        if (images[0]) pkg.image = images[0];
      } else if (image) {
        pkg.image = image;
        // If no images array exists, create one with the single image
        if (!pkg.images || pkg.images.length === 0) {
          pkg.images = [image];
        }
      }
      
      pkg.isActive = isActive !== undefined ? isActive : pkg.isActive;
      
      const updatedPackage = await pkg.save();
      res.json(updatedPackage);
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (pkg) {
      await pkg.deleteOne();
      res.json({ message: 'Package removed' });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- Partner Management ---
exports.getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({}).select('-password');
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approvePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (partner) {
      partner.isApproved = true;
      const updatedPartner = await partner.save();
      res.json(updatedPartner);
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Order & Dashboard ---
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'fullName')
      .populate('package', 'name image images')
      .populate('assignedPartner', 'companyName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPackages = await Package.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalPartners = await Partner.countDocuments();
    const pendingPartners = await Partner.countDocuments({ isApproved: false });

    res.json({ totalPackages, totalOrders, totalPartners, pendingPartners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin can forcibly assign a partner to an order
exports.assignPartner = async (req, res) => {
  try {
    const { partnerId } = req.body;
    console.log(`Admin assigning partner ${partnerId} to order ${req.params.id}`);
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.error('Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner || !partner.isApproved) {
      console.error('Partner not available or not approved:', partnerId);
      return res.status(400).json({ message: 'Partner not available or not approved' });
    }

    console.log(`Assigning order ${order._id} to partner ${partner.companyName} (${partnerId})`);
    order.assignedPartner = partnerId;
    order.status = 'Accepted';
    const updated = await order.save();
    console.log('Order updated successfully:', updated._id, 'assignedPartner:', updated.assignedPartner);

    // Notify partner and customer via sockets if available
    try { 
      req.io.to(partnerId.toString()).emit('assignedOrder', updated);
      console.log('Emitted assignedOrder to partner:', partnerId);
    } catch (e) {
      console.error('Failed to emit to partner:', e);
    }
    try { 
      req.io.to(order.customer.toString()).emit('orderStatusChanged', { orderId: order._id, newStatus: 'Accepted', partner: partner.companyName });
      console.log('Emitted orderStatusChanged to customer:', order.customer);
    } catch (e) {
      console.error('Failed to emit to customer:', e);
    }

    res.json(updated);
  } catch (error) {
    console.error('Error in assignPartner:', error);
    res.status(500).json({ message: error.message });
  }
};

// Allow customers to rate a package
exports.ratePackage = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    const newCount = (pkg.ratingCount || 0) + 1;
    const newAvg = ((pkg.rating || 0) * (pkg.ratingCount || 0) + rating) / newCount;
    pkg.rating = Math.round(newAvg * 10) / 10; // keep one decimal
    pkg.ratingCount = newCount;
    await pkg.save();

    res.json({ message: 'Thank you for rating!', package: pkg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
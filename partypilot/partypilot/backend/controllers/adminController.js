// backend/controllers/adminController.js
const Package = require('../models/Package');
const Partner = require('../models/Partner');
const Order = require('../models/Order');

// --- Package Management ---
exports.createPackage = async (req, res) => {
  const { name, description, price, features, image } = req.body;
  try {
    const pkg = new Package({ name, description, price, features, image });
    const createdPackage = await pkg.save();
    res.status(201).json(createdPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find({});
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  const { name, description, price, features, image, isActive } = req.body;
  try {
    const pkg = await Package.findById(req.params.id);
    if (pkg) {
      pkg.name = name || pkg.name;
      pkg.description = description || pkg.description;
      pkg.price = price || pkg.price;
      pkg.features = features || pkg.features;
      pkg.image = image || pkg.image;
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
      .populate('package', 'name')
      .populate('assignedPartner', 'companyName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
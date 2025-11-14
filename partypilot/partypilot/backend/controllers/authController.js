// backend/controllers/authController.js
const User = require('../models/User');
const Partner = require('../models/Partner');
const { generateToken } = require('../middleware/authMiddleware');

// --- Customer Auth ---
exports.registerCustomer = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // In a real app, you'd use Twilio/SNS to send this OTP
    console.log(`Mock OTP for ${phone} is: ${otp}`);

    let user = await User.findOne({ phone });

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = await User.create({ phone, otp, otpExpires });
    }
    
    res.status(200).json({ message: 'OTP sent (check console)' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyCustomerOTP = async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const user = await User.findOne({ 
      phone, 
      otp, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const isProfileComplete = !!user.fullName && !!user.address;

    res.status(200).json({
      token: generateToken(user._id, 'customer'),
      userId: user._id,
      role: 'customer',
      isProfileComplete: isProfileComplete
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCustomerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.address = req.body.address || user.address;
            const updatedUser = await user.save();
            res.json({
                fullName: updatedUser.fullName,
                address: updatedUser.address
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- Partner Auth ---
exports.registerPartner = async (req, res) => {
  const { email, password, companyName, phone } = req.body;
  try {
    const partnerExists = await Partner.findOne({ email });
    if (partnerExists) {
      return res.status(400).json({ message: 'Partner already exists' });
    }

    const partner = await Partner.create({
      email,
      password,
      companyName,
      phone
    });

    // Don't log in, wait for admin approval
    res.status(201).json({
      message: 'Registration successful! Please wait for admin approval.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginPartner = async (req, res) => {
  const { email, password } = req.body;
  try {
    const partner = await Partner.findOne({ email });

    if (partner && (await partner.matchPassword(password))) {
      
      if (!partner.isApproved) {
        return res.status(403).json({ message: 'Account not yet approved by admin' });
      }

      res.status(200).json({
        token: generateToken(partner._id, 'partner'),
        userId: partner._id,
        role: 'partner'
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Admin Auth ---
// This is a "backdoor" to create the first admin or log in
// In a real app, you'd have a secure script for this.
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    
    // Check against hardcoded admin credentials
    if (email === 'admin@partypilot.com' && password === 'admin123') {
        res.json({
            token: generateToken('ADMIN_ID_001', 'admin'),
            userId: 'ADMIN_ID_001',
            role: 'admin'
        });
    } else {
        res.status(401).json({ message: 'Invalid admin credentials' });
    }
};
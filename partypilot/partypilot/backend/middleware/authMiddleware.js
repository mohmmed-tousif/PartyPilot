// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');

// Simple helper to generate token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by role
      if (decoded.role === 'customer') {
        req.user = await User.findById(decoded.id).select('-otp -otpExpires');
      } else if (decoded.role === 'partner') {
        req.user = await Partner.findById(decoded.id).select('-password');
      } else if (decoded.role === 'admin') {
        // Assuming admin is a type of user or partner with special role
        // For simplicity, let's use a hardcoded admin check or a separate model
        // Here, we'll just attach the decoded info. Use roleMiddleware for checks.
        req.user = decoded; 
      }
      
      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// --- Error Handlers ---
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(444); // Using 444 as a custom "Not Found" to distinguish from API 404
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come in with a 200 status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};


module.exports = { generateToken, protect, notFound, errorHandler };
// backend/middleware/roleMiddleware.js

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const partner = (req, res, next) => {
  if (req.user && req.user.role === 'partner' && req.user.isApproved) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an approved partner' });
  }
};

const customer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a customer' });
  }
};

module.exports = { admin, partner, customer };
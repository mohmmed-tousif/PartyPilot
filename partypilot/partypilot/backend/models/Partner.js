// backend/models/Partner.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PartnerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true },
  phone: { type: String, required: true },
  isApproved: { type: Boolean, default: false }, // Admin must approve
  role: { type: String, default: 'partner' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
PartnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
PartnerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Partner', PartnerSchema);
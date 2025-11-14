// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  fullName: { type: String },
  address: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  role: { type: String, default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
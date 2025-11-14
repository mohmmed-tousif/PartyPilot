// backend/models/Package.js
const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: 'https://via.placeholder.com/400x300' }, // Placeholder image
  features: [String],
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Package', PackageSchema);
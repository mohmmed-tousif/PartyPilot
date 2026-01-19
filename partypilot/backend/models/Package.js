// backend/models/Package.js
const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  rating: { type: Number, default: 4.5 },
  ratingCount: { type: Number, default: 0 },
  capacity: { type: Number, default: 100 },
  duration: { type: String, default: 'Full Day' },
  colorTheme: { type: String, default: '#FFD54F' },
  image: { type: String, default: 'https://via.placeholder.com/400x300' }, // Single image (for backward compatibility)
  images: [{ type: String }], // Multiple images array
  features: [String],
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Package', PackageSchema);
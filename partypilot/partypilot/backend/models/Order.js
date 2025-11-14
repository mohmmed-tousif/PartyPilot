// backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  assignedPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', default: null },
  status: {
    type: String,
    enum: ['Received', 'Accepted', 'Declined', 'Partner Reached', 'Setup Complete', 'Ready for Pickup', 'Picked Up'],
    default: 'Received'
  },
  paymentAmount: { type: Number, required: true },
  paymentType: { type: String, enum: ['25%', '100%'], required: true },
  eventDate: { type: Date, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
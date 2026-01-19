// backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  assignedPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', default: null },
  status: {
    type: String,
    enum: ['Received', 'Accepted', 'Declined', 'Partner Reached', 'Setup Complete', 'Ready for Pickup', 'Picked Up', 'Completed', 'Cancelled'],
    default: 'Received'
  },
  paymentAmount: { type: Number, required: true },
  paymentType: { type: String, enum: ['25%', '100%', 'Cash', 'Online'], required: true },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Partially Paid', 'Refunded', 'Failed'],
    default: 'Pending'
  },
  paymentId: { type: String },
  paymentMethod: { type: String, enum: ['stripe', 'razorpay', 'cash', 'bank_transfer'] },
  eventDate: { type: Date, required: true },
  address: { type: String, required: true },
  deliveryLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null }
  },
  notes: { type: String },
  cancellationReason: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    state: { type: String, required: true },
    at: { type: Date, default: Date.now },
    byRole: { type: String }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [
      {
        packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
        qty: { type: Number, default: 1 },
        priceAtPurchase: Number
      }
    ],
    payment: {
      mode: { type: String, default: 'online' },
      amountPaid: Number,
      totalAmount: Number,
      paidPercent: Number, // 25 or 100
      status: { type: String, default: 'pending' },
      txnRef: String
    },
    status: {
      type: String,
      enum: [
        'received',
        'accepted',
        'partner_reached',
        'setup_complete',
        'ready_for_pickup',
        'picked_up',
        'declined',
        'cancelled'
      ],
      default: 'received'
    },
    statusHistory: [statusHistorySchema],
    addressSnapshot: {
      name: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      pincode: String,
      phone: String
    },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);

import Order from '../models/Order.js';
import User from '../models/User.js';
import Package from '../models/Package.js';
import { simulatePayment } from '../utils/paymentStub.js';
import { canTransition } from '../utils/transitions.js';


export async function createOrder(customerId, { items, payPercent }) {
  const customer = await User.findById(customerId);
  if (!customer || !customer.isVerified) throw new Error('Customer not verified');

  const itemDetails = [];
  let totalAmount = 0;

  for (const it of items) {
    const pkg = await Package.findById(it.packageId);
    if (!pkg) throw new Error('Invalid package');
    itemDetails.push({ packageId: pkg._id, qty: it.qty || 1, priceAtPurchase: pkg.price });
    totalAmount += pkg.price * (it.qty || 1);
  }

  const payment = await simulatePayment(totalAmount, payPercent);

  const order = await Order.create({
    customerId,
    items: itemDetails,
    payment: {
      mode: 'online',
      amountPaid: payment.paidAmount,
      totalAmount,
      paidPercent: payPercent,
      status: payment.status,
      txnRef: payment.txnRef
    },
    statusHistory: [{ state: 'received', byRole: 'customer' }]
  });

  return order;
}

export async function updateOrderStatus({ orderId, nextStatus, actor }) {
   const order = await Order.findById(orderId);
   if (!order) throw new Error('Order not found');

   // Role-based restrictions
   if (['partner_reached', 'setup_complete', 'picked_up'].includes(nextStatus)) {
     if (actor.role !== 'partner' || String(order.partnerId) !== String(actor._id)) {
       throw new Error('Only assigned partner can set this status');
     }
   }
   if (nextStatus === 'ready_for_pickup' && actor.role !== 'customer') {
     throw new Error('Only customer can mark ready_for_pickup');
   }

   if (!canTransition(order.status, nextStatus)) {
     throw new Error(`Invalid transition from ${order.status} to ${nextStatus}`);
   }

   order.status = nextStatus;
   order.statusHistory.push({ state: nextStatus, byRole: actor.role });
   await order.save();
   return order;
}

export async function listCustomerOrders(customerId) {
  return Order.find({ customerId }).sort({ createdAt: -1 }).populate('items.packageId');
}

export async function listPartnerIncoming(partnerId) {
  return Order.find({
    partnerId: null,
    status: 'received'
  }).sort({ createdAt: -1 }).populate('items.packageId');
}

export async function acceptOrder(orderId, partnerId) {
  return Order.findByIdAndUpdate(
    orderId,
    {
      partnerId,
      status: 'accepted',
      $push: { statusHistory: { state: 'accepted', byRole: 'partner' } }
    },
    { new: true }
  );
}

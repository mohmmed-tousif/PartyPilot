// backend/controllers/paymentController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { sendPaymentReceipt } = require('../utils/emailService');

// Initialize Stripe (optional - only if configured)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe payment gateway initialized');
  } catch (error) {
    console.warn('⚠️  Stripe initialization failed:', error.message);
  }
} else {
  console.log('ℹ️  Stripe not configured (optional)');
}

// Initialize Razorpay (optional - only if configured)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay payment gateway initialized');
  } catch (error) {
    console.warn('⚠️  Razorpay initialization failed:', error.message);
  }
} else {
  console.log('ℹ️  Razorpay not configured (optional)');
}

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private (Customer)
exports.createStripePaymentIntent = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe payment gateway not configured' });
  }
  
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Order ID and amount are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: orderId,
        customerId: req.user.id
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm Stripe Payment
// @route   POST /api/payments/stripe/confirm
// @access  Private (Customer)
exports.confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      const order = await Order.findById(orderId).populate('package').populate('customer');
      
      if (order) {
        order.paymentStatus = 'Paid';
        order.paymentId = paymentIntentId;
        await order.save();

        // Create payment record
        const payment = new Payment({
          order: orderId,
          customer: req.user.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          paymentMethod: 'stripe',
          transactionId: paymentIntentId,
          status: 'completed'
        });
        await payment.save();

        // Send receipt email
        try {
          await sendPaymentReceipt({
            id: paymentIntentId,
            amount: paymentIntent.amount,
            status: 'succeeded',
            method: 'Card'
          }, order, order.customer);
        } catch (emailError) {
          console.error('Error sending receipt:', emailError);
        }

        res.json({ message: 'Payment confirmed', order, payment });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/create-order
// @access  Private (Customer)
exports.createRazorpayOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: 'Razorpay payment gateway not configured' });
  }
  
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Order ID and amount are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId,
        customerId: req.user.id
      }
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/razorpay/verify
// @access  Private (Customer)
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      // Payment is valid
      const order = await Order.findById(orderId).populate('package').populate('customer');
      
      if (order) {
        order.paymentStatus = 'Paid';
        order.paymentId = razorpay_payment_id;
        await order.save();

        // Create payment record
        const payment = new Payment({
          order: orderId,
          customer: req.user.id,
          amount: order.paymentAmount,
          currency: 'INR',
          paymentMethod: 'razorpay',
          transactionId: razorpay_payment_id,
          status: 'completed'
        });
        await payment.save();

        // Send receipt email
        try {
          await sendPaymentReceipt({
            id: razorpay_payment_id,
            amount: order.paymentAmount * 100,
            status: 'succeeded',
            method: 'Razorpay'
          }, order, order.customer);
        } catch (emailError) {
          console.error('Error sending receipt:', emailError);
        }

        res.json({ message: 'Payment verified successfully', order, payment });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Payment History
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user.id })
      .populate('order')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/payments/webhook/stripe
// @access  Public (Stripe)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update order status
      const orderId = paymentIntent.metadata.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'Paid';
          order.paymentId = paymentIntent.id;
          await order.save();
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

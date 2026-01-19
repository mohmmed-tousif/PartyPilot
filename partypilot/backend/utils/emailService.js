// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send OTP Email
exports.sendOTPEmail = async (email, otp, phone) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'PartyPilot <noreply@partypilot.com>',
      to: email,
      subject: 'Your PartyPilot Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">PartyPilot</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Verification Code</h2>
            <p style="color: #666; font-size: 16px;">Your OTP for phone number <strong>${phone}</strong> is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 20px 0; border-radius: 8px;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send Order Confirmation Email
exports.sendOrderConfirmation = async (order, customer) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'PartyPilot <noreply@partypilot.com>',
      to: customer.email || customer.phone + '@example.com',
      subject: `Order Confirmation - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Order Confirmed! 🎉</h2>
          <p>Dear ${customer.fullName || 'Customer'},</p>
          <p>Thank you for your order. Your order has been received and is being processed.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Package:</strong> ${order.package.name}</p>
            <p><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</p>
            <p><strong>Address:</strong> ${order.address}</p>
            <p><strong>Amount:</strong> $${order.paymentAmount}</p>
            <p><strong>Payment Type:</strong> ${order.paymentType}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <p>We'll notify you once a partner is assigned to your order.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">Thank you for choosing PartyPilot!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', customer.email || customer.phone);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

// Send Order Status Update Email
exports.sendOrderStatusUpdate = async (order, customer, newStatus) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'PartyPilot <noreply@partypilot.com>',
      to: customer.email || customer.phone + '@example.com',
      subject: `Order Update - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Order Status Updated</h2>
          <p>Dear ${customer.fullName || 'Customer'},</p>
          <p>Your order status has been updated to: <strong style="color: #667eea;">${newStatus}</strong></p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Package:</strong> ${order.package.name}</p>
            <p><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</p>
          </div>
          
          <p>Track your order status in your dashboard.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
};

// Send Payment Receipt
exports.sendPaymentReceipt = async (payment, order, customer) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'PartyPilot <noreply@partypilot.com>',
      to: customer.email || customer.phone + '@example.com',
      subject: `Payment Receipt - ${payment.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Payment Receipt</h2>
          <p>Dear ${customer.fullName || 'Customer'},</p>
          <p>Your payment has been successfully processed.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Payment Details</h3>
            <p><strong>Transaction ID:</strong> ${payment.id}</p>
            <p><strong>Amount:</strong> $${payment.amount / 100}</p>
            <p><strong>Status:</strong> ${payment.status}</p>
            <p><strong>Method:</strong> ${payment.method}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Package:</strong> ${order.package.name}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">This is an automated receipt. Please keep it for your records.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending payment receipt:', error);
    return false;
  }
};

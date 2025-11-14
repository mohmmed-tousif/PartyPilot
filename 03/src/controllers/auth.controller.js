// src/controllers/auth.controller.js
import User from '../models/User.js';
import OtpToken from '../models/OtpToken.js';
import { generateOtp } from '../utils/otp.js';
import { sendOtpStub } from '../utils/email.js';
import jwt from 'jsonwebtoken';

/**
 * POST /api/auth/customer/request-otp
 * Body: { emailOrPhone }
 */
export async function requestCustomerOtp(req, res) {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) return res.status(400).json({ ok: false, message: 'Missing emailOrPhone' });

    const code = generateOtp(); // 6-digit
    const otpDoc = await OtpToken.create({
      destination: emailOrPhone,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // stub sending
    sendOtpStub(emailOrPhone, code);

    return res.json({ ok: true, masked: String(emailOrPhone).replace(/(.{2}).+(.{2})/, '$1***$2') });
  } catch (err) {
    console.error('requestCustomerOtp', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
}

/**
 * POST /api/auth/customer/verify-otp
 * Body: { emailOrPhone, code }
 */
export async function verifyCustomerOtp(req, res) {
  try {
    const { emailOrPhone, code } = req.body;
    if (!emailOrPhone || !code) return res.status(400).json({ ok: false, message: 'Missing fields' });

    const tokenDoc = await OtpToken.findOne({ destination: emailOrPhone, code }).sort({ createdAt: -1 });
    if (!tokenDoc) return res.status(400).json({ ok: false, message: 'Invalid code' });
    if (tokenDoc.expiresAt < new Date()) return res.status(400).json({ ok: false, message: 'OTP expired' });

    // find or create user
    let user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) {
      user = await User.create({
        role: 'customer',
        email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : undefined,
        isVerified: true
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    // issue JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });

    res.json({ ok: true, token, user });
  } catch (err) {
    console.error('verifyCustomerOtp', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
}

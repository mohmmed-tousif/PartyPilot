import bcrypt from 'bcrypt';
import User from '../models/User.js';
import OtpToken from '../models/OtpToken.js';
import { generateOtp } from '../utils/otp.js';
import { sendOtpStub } from '../utils/email.js';
import { signToken } from '../utils/jwt.js';

export async function requestCustomerOtp(req, res, next) {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) return res.status(400).json({ ok: false, message: 'Missing emailOrPhone' });

    let user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) {
      user = await User.create({ role: 'customer', email: emailOrPhone });
    }

    const code = generateOtp();
    await OtpToken.create({ userId: user._id, code, expiresAt: Date.now() + 5 * 60 * 1000 });
    await sendOtpStub(emailOrPhone, code);

    res.json({ ok: true, destination: emailOrPhone });
  } catch (err) {
    next(err);
  }
}

export async function verifyCustomerOtp(req, res, next) {
  try {
    const { emailOrPhone, code } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(400).json({ ok: false, message: 'Invalid user' });

    const token = await OtpToken.findOne({ userId: user._id, code });
    if (!token || token.expiresAt < Date.now())
      return res.status(400).json({ ok: false, message: 'Invalid or expired code' });

    user.isVerified = true;
    await user.save();
    await OtpToken.deleteMany({ userId: user._id }); // cleanup

    const jwt = signToken(user);
    res.json({ ok: true, token: jwt });
  } catch (err) {
    next(err);
  }
}

export async function partnerAdminLogin(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role }).select('+passwordHash');
    if (!user) return res.status(400).json({ ok: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ ok: false, message: 'Invalid credentials' });

    const jwt = signToken(user);
    res.json({ ok: true, token: jwt });
  } catch (err) {
    next(err);
  }
}

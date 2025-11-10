import User from '../models/User.js';

export async function upsertCustomerProfile(req, res, next) {
  try {
    const { fullName, addressLine1, addressLine2, city, pincode, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'customer') return res.status(403).json({ ok: false, message: 'Forbidden' });

    user.profile = { fullName, addressLine1, addressLine2, city, pincode, phone };
    await user.save();
    res.json({ ok: true, profile: user.profile });
  } catch (e) { next(e); }
}

export async function me(req, res) {
  const { _id, role, email, phone, isVerified, profile, createdAt } = req.user;
  res.json({ ok: true, user: { id: _id, role, email, phone, isVerified, profile, createdAt } });
}

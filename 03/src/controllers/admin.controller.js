import User from '../models/User.js';
import Order from '../models/Order.js';
import Bulletin from '../models/Bulletin.js';

export async function listVendors(_req, res) {
  const users = await User.find({ role: 'partner' }).select('-passwordHash');
  res.json({ ok: true, vendors: users });
}

export async function listCustomers(_req, res) {
  const users = await User.find({ role: 'customer' }).select('-passwordHash');
  res.json({ ok: true, customers: users });
}

export async function revenue(_req, res) {
  const agg = await Order.aggregate([
    { $match: { 'payment.status': 'success' } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$payment.totalAmount' },
        totalPaid: { $sum: '$payment.amountPaid' },
        count: { $count: {} }
      }
    }
  ]);
  res.json({ ok: true, revenue: agg[0] || { totalAmount: 0, totalPaid: 0, count: 0 } });
}

export async function createBulletin(req, res) {
  const b = await Bulletin.create({ title: req.body.title, message: req.body.message, audience: req.body.audience || 'partners' });
  res.json({ ok: true, bulletin: b });
}
export async function listBulletins(_req, res) {
  const list = await Bulletin.find().sort({ createdAt: -1 });
  res.json({ ok: true, bulletins: list });
}

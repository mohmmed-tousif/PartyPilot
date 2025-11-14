import Package from '../models/Package.js';

export async function priceCart(req, res, next) {
  try {
    const { items } = req.body; // [{packageId, qty}]
    let total = 0;
    for (const it of items) {
      const pkg = await Package.findById(it.packageId);
      if (!pkg) return res.status(400).json({ ok: false, message: 'Invalid package' });
      total += (it.qty || 1) * (pkg.price || 0);
    }
    res.json({ ok: true, total });
  } catch (e) { next(e); }
}

export async function mockPayment(req, res) {
  const { totalAmount, payPercent } = req.body;
  const txnRef = 'TXN-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  res.json({ ok: true, status: 'success', txnRef, amountPaid: payPercent === 25 ? totalAmount * 0.25 : totalAmount });
}

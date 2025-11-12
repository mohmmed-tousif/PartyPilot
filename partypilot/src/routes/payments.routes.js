import { Router } from "express";
const router = Router();

// Dummy UPI payment simulation
router.post("/mock", (req, res) => {
  const { totalAmount, payPercent } = req.body;
  if (!totalAmount) return res.status(400).json({ ok: false, message: "Missing amount" });

  const paid = Math.round(totalAmount * ((payPercent || 100) / 100));
  return res.json({
    ok: true,
    status: "success",
    txnRef: "MOCK-" + Date.now(),
    paidAmount: paid,
  });
});

export default router;

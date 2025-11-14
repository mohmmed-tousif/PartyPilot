import { Router } from "express";
const router = Router();

// Simple price calculator stub
router.post("/price", (req, res) => {
  try {
    const items = req.body.items || [];
    const total = items.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
    res.json({ ok: true, total });
  } catch (err) {
    console.error("Cart price error:", err);
    res.status(500).json({ ok: false, message: "Failed to calculate total" });
  }
});

router.post("/price", (req, res) => {
  const items = req.body.items || [];
  const total = items.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
  res.json({ ok: true, total });
});

export default router;
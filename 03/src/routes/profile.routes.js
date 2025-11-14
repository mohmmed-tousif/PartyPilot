
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMe, updateCustomerProfile } from "../controllers/profile.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.post("/customer", requireAuth, updateCustomerProfile);

export default router;

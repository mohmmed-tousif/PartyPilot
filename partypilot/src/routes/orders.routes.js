// src/routes/orders.routes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import { requireAuth } from "../middleware/auth.js";
import {
  createOrderController,
  customerOrdersController,
  cancelOrderController,
} from "../controllers/orders.controller.js";

const router = Router();

// 🛒 Customer Order Routes
router.post("/", requireAuth, createOrderController);
router.get("/my", requireAuth, customerOrdersController);
router.post("/:id/cancel", authMiddleware("customer"), cancelOrderController);



export default router;

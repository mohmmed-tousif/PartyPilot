// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

/**
 * Verifies JWT and optionally enforces a specific user role
 * Usage example: router.get('/orders', authMiddleware('customer'), handler)
 */
export function authMiddleware(role = null) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (!token) {
        return res
          .status(401)
          .json({ ok: false, code: 401, message: "Missing token" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (role && decoded.role !== role) {
        return res
          .status(403)
          .json({ ok: false, code: 403, message: "Forbidden for this role" });
      }

      next();
    } catch (err) {
      console.error("Auth middleware error:", err.message);
      return res
        .status(401)
        .json({ ok: false, code: 401, message: "Invalid or expired token" });
    }
  };
}

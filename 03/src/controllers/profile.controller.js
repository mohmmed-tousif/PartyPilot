// src/controllers/profile.controller.js
import User from "../models/User.js";

// ✅ Fetch current user
export async function getMe(req, res) {
  try {
    const id = req.user?.id || req.user?._id;
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });
    return res.json({ ok: true, user });
  } catch (err) {
    console.error("getMe", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}

// ✅ Create or update customer profile
export async function updateCustomerProfile(req, res) {
  try {
    const id = req.user?.id || req.user?._id;
    const update = {
      profile: {
        fullName: req.body.fullName,
        phone: req.body.phone,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        city: req.body.city,
        pincode: req.body.pincode,
      },
      isVerified: true,
    };

    const user = await User.findByIdAndUpdate(id, update, { new: true }).lean();
    return res.json({ ok: true, user }); // 👈 important
  } catch (err) {
    console.error("updateCustomerProfile", err);
    return res.status(500).json({ ok: false, message: "Profile update failed" });
  }
}

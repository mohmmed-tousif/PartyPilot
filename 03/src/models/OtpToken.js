// src/models/OtpToken.js
import mongoose from "mongoose";

const otpTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // ✅ not required at OTP request time
  },
  destination: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("OtpToken", otpTokenSchema);

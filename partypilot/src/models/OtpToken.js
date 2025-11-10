import mongoose from 'mongoose';

const otpTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OtpToken', otpTokenSchema);

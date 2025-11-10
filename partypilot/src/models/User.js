import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    pincode: String,
    phone: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['customer', 'partner', 'admin'], required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, select: false },
    isVerified: { type: Boolean, default: false },
    profile: profileSchema
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: false });
userSchema.index({ phone: 1 }, { unique: false });

export default mongoose.model('User', userSchema);

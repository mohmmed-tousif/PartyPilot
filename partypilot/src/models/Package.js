import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    features: [String],
    price: Number,
    images: [String],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Package', packageSchema);

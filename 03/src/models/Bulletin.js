import mongoose from 'mongoose';

const bulletinSchema = new mongoose.Schema(
  { title: String, message: String, audience: { type: String, enum: ['partners', 'all'], default: 'partners' } },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.model('Bulletin', bulletinSchema);

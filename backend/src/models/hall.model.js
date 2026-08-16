import mongoose from 'mongoose';

const seatTierSchema = new mongoose.Schema({
  tierName: { type: String, required: true }, // e.g. "VIP / Recliner", "Premium", "Standard", "Economy"
  seatCount: { type: Number, required: true, min: 1 },
  price: { type: Number, default: 0 },
});

const hallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    screenType: {
      type: String,
      enum: ['IMAX 3D', '4DX', 'Dolby Cinema', 'Standard 2D', 'ScreenX'],
      default: 'Standard 2D',
    },
    seatTiers: [seatTierSchema],
    totalCapacity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'halls',
  }
);

hallSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Hall = mongoose.model('Hall', hallSchema);

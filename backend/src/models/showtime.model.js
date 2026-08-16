import mongoose from 'mongoose';

const tierPriceSchema = new mongoose.Schema({
  tierName: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
});

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: true,
    },
    showDate: { type: String, required: true }, // e.g. "2026-08-15"
    showTime: { type: String, required: true }, // e.g. "07:30 PM"
    format: { type: String, default: 'Standard 2D' },
    tierPrices: [tierPriceSchema],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'showtimes',
  }
);

showtimeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Showtime = mongoose.model('Showtime', showtimeSchema);

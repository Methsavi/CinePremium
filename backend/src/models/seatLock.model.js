import mongoose from 'mongoose';

const seatLockSchema = new mongoose.Schema({
  showtimeId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  seatId: {
    type: String,
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Automatically delete document after 10 minutes (600 seconds)
  }
});

// Compound index to ensure a seat can only be locked once per showtime & date
seatLockSchema.index({ showtimeId: 1, date: 1, seatId: 1 }, { unique: true });

export const SeatLockModel = mongoose.model('SeatLock', seatLockSchema);

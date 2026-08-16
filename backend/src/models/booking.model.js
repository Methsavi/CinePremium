import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie', // assuming you have a Movie model or store movie details
      // If movie is passed from static data, we can store movie name/id as string
    },
    movieId: {
      type: String,
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    cinemaId: {
      type: String,
      required: true,
    },
    cinemaName: {
      type: String,
      required: true,
    },
    showtimeId: {
      type: String,
      required: true,
    },
    showtimeTime: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    seats: [
      {
        id: String,
        row: String,
        number: Number,
        type: { type: String },
        price: Number,
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
    collection: 'bookings',
  }
);

bookingSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const BookingModel = mongoose.model('Booking', bookingSchema);

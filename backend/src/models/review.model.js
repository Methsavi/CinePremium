import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: true,
      index: true,
    },
    movieTitle: {
      type: String,
      default: '',
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      default: '',
    },
    userAvatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'reviews',
  }
);

reviewSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Review = mongoose.model('Review', reviewSchema);

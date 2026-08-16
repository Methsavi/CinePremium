import mongoose from 'mongoose';

const castMemberSchema = new mongoose.Schema({
  id: String,
  name: String,
  role: String,
  avatarUrl: String,
});

const reviewSchema = new mongoose.Schema({
  id: String,
  author: String,
  rating: Number,
  comment: String,
});

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tagline: String,
    synopsis: String,
    posterUrl: String,
    backdropUrl: String,
    rating: Number,
    duration: String,
    genres: [String],
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      required: true,
    },
    releaseDate: String,
    trailerUrl: String,
    castMembers: [castMemberSchema],
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
    collection: 'movies',
  }
);

movieSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Movie = mongoose.model('Movie', movieSchema);

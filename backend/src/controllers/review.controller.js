import { Review } from '../models/review.model.js';
import { Movie } from '../models/movie.model.js';
import { UserModel } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper to resolve actual username for review records
const resolveReviewUsernames = async (reviews) => {
  return await Promise.all(
    reviews.map(async (r) => {
      const reviewObj = r.toObject ? r.toObject() : { ...r };
      if (!reviewObj.userName || reviewObj.userName === 'Verified Cinephile' || reviewObj.userName.trim() === '') {
        try {
          if (reviewObj.userId) {
            const userDoc = await UserModel.findById(reviewObj.userId);
            if (userDoc && userDoc.name) {
              reviewObj.userName = userDoc.name;
            }
          }
        } catch {}
        if (!reviewObj.userName || reviewObj.userName === 'Verified Cinephile') {
          reviewObj.userName = reviewObj.userEmail ? reviewObj.userEmail.split('@')[0] : 'User';
        }
      }
      return reviewObj;
    })
  );
};

// @desc    Get all reviews for a specific movie
// @route   GET /api/v1/reviews/movie/:movieId
export const getMovieReviews = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const reviews = await Review.find({ movieId }).sort({ createdAt: -1 });
  const resolvedReviews = await resolveReviewUsernames(reviews);
  res.status(200).json(new ApiResponse(200, resolvedReviews, 'Reviews fetched successfully'));
});

// @desc    Get all reviews across all movies (Admin / Management)
// @route   GET /api/v1/reviews
export const getAllReviews = asyncHandler(async (req, res) => {
  const { movieId } = req.query;
  const filter = movieId ? { movieId } : {};
  const reviews = await Review.find(filter).sort({ createdAt: -1 });
  const resolvedReviews = await resolveReviewUsernames(reviews);
  res.status(200).json(new ApiResponse(200, resolvedReviews, 'All reviews fetched successfully'));
});

// @desc    Create a new review / feedback for a movie
// @route   POST /api/v1/reviews/movie/:movieId
export const createReview = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { rating, comment, movieTitle } = req.body;

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    throw new ApiError(400, 'Rating must be a number between 1 and 5 stars');
  }

  if (!comment || comment.trim().length === 0) {
    throw new ApiError(400, 'Review comment text cannot be empty');
  }

  // Get user details from JWT token
  const userId = req.user.id || req.user._id || req.user.userId;
  let userName = req.user.name || req.body.userName;
  let userEmail = req.user.email || req.body.userEmail || '';

  // Look up user name if not present in token payload
  if (!userName && userId) {
    try {
      const userDoc = await UserModel.findById(userId);
      if (userDoc) {
        userName = userDoc.name;
        userEmail = userEmail || userDoc.email;
      }
    } catch {}
  }

  if (!userName) {
    userName = userEmail ? userEmail.split('@')[0] : 'User';
  }

  // Get movie title if not passed
  let resolvedMovieTitle = movieTitle;
  if (!resolvedMovieTitle) {
    try {
      const foundMovie = await Movie.findById(movieId);
      if (foundMovie) {
        resolvedMovieTitle = foundMovie.title;
      }
    } catch {
      resolvedMovieTitle = 'CinePremium Feature';
    }
  }

  const review = await Review.create({
    movieId,
    movieTitle: resolvedMovieTitle || 'Movie Feature',
    userId,
    userName,
    userEmail,
    rating: Number(rating),
    comment: comment.trim(),
  });

  res.status(201).json(new ApiResponse(201, review, 'Feedback submitted successfully'));
});

// @desc    Update an existing review / feedback
// @route   PUT /api/v1/reviews/:id
export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  const requesterId = req.user.id || req.user._id || req.user.userId;
  const requesterRole = req.user.role;

  // Only the author or site admin can update
  if (review.userId !== requesterId && requesterRole !== 'admin') {
    throw new ApiError(403, 'Forbidden: You can only edit your own reviews');
  }

  if (rating !== undefined) {
    if (Number(rating) < 1 || Number(rating) > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5 stars');
    }
    review.rating = Number(rating);
  }

  if (comment !== undefined) {
    if (comment.trim().length === 0) {
      throw new ApiError(400, 'Comment text cannot be empty');
    }
    review.comment = comment.trim();
  }

  await review.save();

  res.status(200).json(new ApiResponse(200, review, 'Review updated successfully'));
});

// @desc    Delete a review / feedback
// @route   DELETE /api/v1/reviews/:id
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  const requesterId = req.user.id || req.user._id || req.user.userId;
  const requesterRole = req.user.role;

  // Author, admin, or cinema_manager can delete
  const isOwner = review.userId === requesterId;
  const isPrivileged = ['admin', 'cinema_manager'].includes(requesterRole);

  if (!isOwner && !isPrivileged) {
    throw new ApiError(403, 'Forbidden: You do not have permission to delete this review');
  }

  await Review.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, { id }, 'Review deleted successfully'));
});

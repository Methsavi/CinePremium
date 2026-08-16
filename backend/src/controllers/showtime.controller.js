import { Showtime } from '../models/showtime.model.js';
import { Movie } from '../models/movie.model.js';
import { Hall } from '../models/hall.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get all showtimes / forecastings
// @route   GET /api/v1/showtimes
export const getShowtimes = asyncHandler(async (req, res) => {
  const showtimes = await Showtime.find({})
    .populate('movie')
    .populate('hall')
    .sort({ showDate: 1, showTime: 1 });

  res.status(200).json(new ApiResponse(200, showtimes, 'Showtimes fetched successfully'));
});

// @desc    Create / schedule a new showtime forecasting
// @route   POST /api/v1/showtimes
export const createShowtime = asyncHandler(async (req, res) => {
  const { movieId, hallId, showDate, showTime, format, tierPrices } = req.body;

  if (!movieId || !hallId || !showDate || !showTime) {
    throw new ApiError(400, 'Movie, Hall, Show Date, and Show Time are required');
  }

  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new ApiError(404, 'Movie not found');
  }

  const hall = await Hall.findById(hallId);
  if (!hall) {
    throw new ApiError(404, 'Cinema Hall not found');
  }

  const showtime = await Showtime.create({
    movie: movieId,
    hall: hallId,
    showDate,
    showTime,
    format: format || hall.screenType || 'Standard 2D',
    tierPrices: tierPrices || [],
  });

  const populatedShowtime = await Showtime.findById(showtime._id)
    .populate('movie')
    .populate('hall');

  res.status(201).json(new ApiResponse(201, populatedShowtime, 'Showtime scheduled successfully'));
});

// @desc    Delete showtime
// @route   DELETE /api/v1/showtimes/:id
export const deleteShowtime = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const showtime = await Showtime.findByIdAndDelete(id);

  if (!showtime) {
    throw new ApiError(404, 'Showtime not found');
  }

  res.status(200).json(new ApiResponse(200, showtime, 'Showtime deleted successfully'));
});

import { Showtime } from '../models/showtime.model.js';
import { Movie } from '../models/movie.model.js';
import { Hall } from '../models/hall.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { broadcastCatalogEvent } from '../socket/seatSocket.js';

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

  broadcastCatalogEvent(req.app.get('io'), 'showtime-created', populatedShowtime);

  res.status(201).json(new ApiResponse(201, populatedShowtime, 'Showtime scheduled successfully'));
});

// @desc    Get single showtime by ID
// @route   GET /api/v1/showtimes/:id
export const getShowtimeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const showtime = await Showtime.findById(id)
    .populate('movie')
    .populate('hall');

  if (!showtime) {
    throw new ApiError(404, 'Showtime not found');
  }

  res.status(200).json(new ApiResponse(200, showtime, 'Showtime fetched successfully'));
});

// @desc    Update showtime scheduling & pricing
// @route   PUT /api/v1/showtimes/:id
export const updateShowtime = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { movieId, hallId, showDate, showTime, format, tierPrices, isActive } = req.body;

  const existingShowtime = await Showtime.findById(id);
  if (!existingShowtime) {
    throw new ApiError(404, 'Showtime not found');
  }

  if (movieId) {
    const movie = await Movie.findById(movieId);
    if (!movie) throw new ApiError(404, 'Movie not found');
  }

  if (hallId) {
    const hall = await Hall.findById(hallId);
    if (!hall) throw new ApiError(404, 'Cinema Hall not found');
  }

  const updateData = {};
  if (movieId !== undefined) updateData.movie = movieId;
  if (hallId !== undefined) updateData.hall = hallId;
  if (showDate !== undefined) updateData.showDate = showDate;
  if (showTime !== undefined) updateData.showTime = showTime;
  if (format !== undefined) updateData.format = format;
  if (tierPrices !== undefined) updateData.tierPrices = tierPrices;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedShowtime = await Showtime.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('movie')
    .populate('hall');

  broadcastCatalogEvent(req.app.get('io'), 'showtime-updated', updatedShowtime);

  res.status(200).json(new ApiResponse(200, updatedShowtime, 'Showtime updated successfully'));
});

// @desc    Delete showtime
// @route   DELETE /api/v1/showtimes/:id
export const deleteShowtime = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const showtime = await Showtime.findByIdAndDelete(id);

  if (!showtime) {
    throw new ApiError(404, 'Showtime not found');
  }

  broadcastCatalogEvent(req.app.get('io'), 'showtime-deleted', showtime);

  res.status(200).json(new ApiResponse(200, showtime, 'Showtime deleted successfully'));
});

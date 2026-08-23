import { Movie } from '../models/movie.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadFileToR2 } from '../services/r2Storage.service.js';
import { broadcastCatalogEvent } from '../socket/seatSocket.js';

// @desc    Get all movies
// @route   GET /api/v1/movies
export const listMovies = asyncHandler(async (req, res) => {
  const movies = await Movie.find({});
  res.status(200).json(new ApiResponse(200, movies, 'Movies fetched successfully'));
});

// @desc    Get a single movie by ID
// @route   GET /api/v1/movies/:id
export const viewMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const movie = await Movie.findById(id);
  
  if (!movie) {
    throw new ApiError(404, 'Movie not found');
  }
  
  res.status(200).json(new ApiResponse(200, movie, 'Movie fetched successfully'));
});


// @desc    Add a new movie
// @route   POST /api/v1/movies
export const addMovie = asyncHandler(async (req, res) => {
  let posterUrl = req.body.posterUrl;
  let backdropUrl = req.body.backdropUrl;

  if (req.files) {
    if (req.files.poster && req.files.poster[0]) {
      const posterFile = req.files.poster[0];
      posterUrl = await uploadFileToR2(
        posterFile.buffer,
        posterFile.mimetype,
        posterFile.originalname
      );
    }
    if (req.files.backdrop && req.files.backdrop[0]) {
      const backdropFile = req.files.backdrop[0];
      backdropUrl = await uploadFileToR2(
        backdropFile.buffer,
        backdropFile.mimetype,
        backdropFile.originalname
      );
    }
  }

  const movieData = {
    ...req.body,
    posterUrl,
    backdropUrl
  };

  const movie = await Movie.create(movieData);
  broadcastCatalogEvent(req.app.get('io'), 'movie-created', movie);
  res.status(201).json(new ApiResponse(201, movie, 'Movie added successfully'));
});

// @desc    Update an existing movie
// @route   PUT /api/v1/movies/:id
export const updateMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingMovie = await Movie.findById(id);
  if (!existingMovie) {
    throw new ApiError(404, 'Movie not found');
  }

  let posterUrl = req.body.posterUrl !== undefined ? req.body.posterUrl : existingMovie.posterUrl;
  let backdropUrl = req.body.backdropUrl !== undefined ? req.body.backdropUrl : existingMovie.backdropUrl;

  if (req.files) {
    if (req.files.poster && req.files.poster[0]) {
      const posterFile = req.files.poster[0];
      posterUrl = await uploadFileToR2(
        posterFile.buffer,
        posterFile.mimetype,
        posterFile.originalname
      );
    }
    if (req.files.backdrop && req.files.backdrop[0]) {
      const backdropFile = req.files.backdrop[0];
      backdropUrl = await uploadFileToR2(
        backdropFile.buffer,
        backdropFile.mimetype,
        backdropFile.originalname
      );
    }
  }

  // Handle genres parsing if passed as array or strings
  let genres = req.body.genres;
  if (req.body['genres[]']) {
    genres = Array.isArray(req.body['genres[]']) ? req.body['genres[]'] : [req.body['genres[]']];
  } else if (typeof genres === 'string') {
    genres = genres.split(',').map((g) => g.trim()).filter(Boolean);
  }

  const updateData = {
    ...req.body,
    ...(posterUrl !== undefined && { posterUrl }),
    ...(backdropUrl !== undefined && { backdropUrl }),
    ...(genres !== undefined && { genres }),
  };

  delete updateData['genres[]'];

  const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  broadcastCatalogEvent(req.app.get('io'), 'movie-updated', updatedMovie);

  res.status(200).json(new ApiResponse(200, updatedMovie, 'Movie updated successfully'));
});

// @desc    Remove a movie by ID
// @route   DELETE /api/v1/movies/:id
export const removeMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const movie = await Movie.findByIdAndDelete(id);
  
  if (!movie) {
    throw new ApiError(404, 'Movie not found');
  }

  broadcastCatalogEvent(req.app.get('io'), 'movie-deleted', movie);
  
  res.status(200).json(new ApiResponse(200, movie, 'Movie removed successfully'));
});


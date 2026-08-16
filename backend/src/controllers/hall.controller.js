import { Hall } from '../models/hall.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get all cinema halls
// @route   GET /api/v1/halls
export const getHalls = asyncHandler(async (req, res) => {
  const halls = await Hall.find({}).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, halls, 'Cinema halls fetched successfully'));
});

// @desc    Get hall by ID
// @route   GET /api/v1/halls/:id
export const getHallById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hall = await Hall.findById(id);
  if (!hall) {
    throw new ApiError(404, 'Cinema hall not found');
  }
  res.status(200).json(new ApiResponse(200, hall, 'Cinema hall fetched successfully'));
});

// @desc    Create new cinema hall
// @route   POST /api/v1/halls
export const createHall = asyncHandler(async (req, res) => {
  const { name, screenType, seatTiers } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Hall name is required');
  }

  if (!seatTiers || !Array.isArray(seatTiers) || seatTiers.length === 0) {
    throw new ApiError(400, 'At least one seat tier must be defined');
  }

  const totalCapacity = seatTiers.reduce((acc, tier) => acc + (Number(tier.seatCount) || 0), 0);

  const hall = await Hall.create({
    name,
    screenType: screenType || 'Standard 2D',
    seatTiers,
    totalCapacity,
  });

  res.status(201).json(new ApiResponse(201, hall, 'Cinema hall created successfully'));
});

// @desc    Delete cinema hall by ID
// @route   DELETE /api/v1/halls/:id
export const deleteHall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hall = await Hall.findByIdAndDelete(id);

  if (!hall) {
    throw new ApiError(404, 'Cinema hall not found');
  }

  res.status(200).json(new ApiResponse(200, hall, 'Cinema hall deleted successfully'));
});

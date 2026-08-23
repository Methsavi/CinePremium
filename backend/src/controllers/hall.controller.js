import { Hall } from '../models/hall.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { broadcastCatalogEvent } from '../socket/seatSocket.js';

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

  broadcastCatalogEvent(req.app.get('io'), 'hall-created', hall);

  res.status(201).json(new ApiResponse(201, hall, 'Cinema hall created successfully'));
});

// @desc    Update cinema hall by ID
// @route   PUT /api/v1/halls/:id
export const updateHall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, screenType, seatTiers, isActive } = req.body;

  const existingHall = await Hall.findById(id);
  if (!existingHall) {
    throw new ApiError(404, 'Cinema hall not found');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (screenType !== undefined) updateData.screenType = screenType;
  if (isActive !== undefined) updateData.isActive = isActive;

  if (seatTiers !== undefined) {
    if (!Array.isArray(seatTiers) || seatTiers.length === 0) {
      throw new ApiError(400, 'At least one seat tier must be defined');
    }
    updateData.seatTiers = seatTiers;
    updateData.totalCapacity = seatTiers.reduce((acc, tier) => acc + (Number(tier.seatCount) || 0), 0);
  }

  const updatedHall = await Hall.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  broadcastCatalogEvent(req.app.get('io'), 'hall-updated', updatedHall);

  res.status(200).json(new ApiResponse(200, updatedHall, 'Cinema hall updated successfully'));
});

// @desc    Delete cinema hall by ID
// @route   DELETE /api/v1/halls/:id
export const deleteHall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hall = await Hall.findByIdAndDelete(id);

  if (!hall) {
    throw new ApiError(404, 'Cinema hall not found');
  }

  broadcastCatalogEvent(req.app.get('io'), 'hall-deleted', hall);

  res.status(200).json(new ApiResponse(200, hall, 'Cinema hall deleted successfully'));
});

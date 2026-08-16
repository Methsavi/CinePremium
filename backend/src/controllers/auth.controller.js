import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.registerUser(req.body);
  res.status(201).json(new ApiResponse(201, result, 'User registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.loginUser(email, password);
  res.status(200).json(new ApiResponse(200, result, 'User logged in successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getCurrentUser(req.user.id);
  res.status(200).json(new ApiResponse(200, { user }, 'Current user profile fetched successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

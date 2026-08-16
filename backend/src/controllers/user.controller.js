import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await UserService.getAllUsers();
  res.status(200).json(new ApiResponse(200, users, 'Users retrieved successfully'));
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserService.getUserById(id);
  res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
});

export const createUser = asyncHandler(async (req, res) => {
  const newUser = await UserService.createUser(req.body);
  res.status(201).json(new ApiResponse(201, newUser, 'User created successfully'));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedUser = await UserService.updateUser(id, req.body);
  res.status(200).json(new ApiResponse(200, updatedUser, 'User updated successfully'));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedUser = await UserService.deleteUser(id);
  res.status(200).json(new ApiResponse(200, deletedUser, 'User deleted successfully'));
});

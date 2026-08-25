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

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const result = await AuthService.verifyEmail(email, code);
  res.status(200).json(new ApiResponse(200, result, 'Email verified successfully'));
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.resendVerificationCode(email);
  res.status(200).json(new ApiResponse(200, result, 'Verification code resent successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.sendPasswordResetOTP(email);
  res.status(200).json(new ApiResponse(200, result, 'Password reset OTP sent'));
});

export const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyResetOTP(email, otp);
  res.status(200).json(new ApiResponse(200, result, 'OTP verified'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await AuthService.resetPasswordWithOTP(email, otp, newPassword);
  res.status(200).json(new ApiResponse(200, result, 'Password reset successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(req.user.id, oldPassword, newPassword);
  res.status(200).json(new ApiResponse(200, result, 'Password changed successfully'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const result = await AuthService.updateProfile(req.user.id, req.body, req.file);
  res.status(200).json(new ApiResponse(200, result, 'Profile updated successfully'));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const result = await AuthService.deleteAccount(req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Account deleted successfully'));
});

import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';

/**
 * JWT authentication middleware.
 * Expects "Authorization: Bearer <token>" header.
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized request: Missing or invalid authorization token format');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Unauthorized request: Token not provided');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, 'Unauthorized request: Invalid or expired token');
  }
});

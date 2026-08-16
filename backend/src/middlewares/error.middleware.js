import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

/**
 * Global Express error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors,
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

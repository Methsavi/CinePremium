/**
 * Async handler utility to wrap asynchronous request handlers and route errors to express error middleware.
 * @param {Function} requestHandler 
 * @returns {Function}
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

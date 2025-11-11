/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Set default status code
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.details 
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Not found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


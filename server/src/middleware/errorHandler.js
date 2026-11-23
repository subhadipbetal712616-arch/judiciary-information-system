/**
 * Centralized error handler — mounted last in the middleware chain.
 * Returns JSON: { message, stack? } — stack only included in development.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error('[error]', err.message);
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = errorHandler;

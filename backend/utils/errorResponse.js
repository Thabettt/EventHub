/**
 * ErrorResponse utility class
 * Used to create structured, consistent error objects throughout the application.
 * Extends the native Error class with an HTTP status code.
 *
 * Usage:
 *   throw new ErrorResponse('Resource not found', 404);
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;

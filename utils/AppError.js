class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // "expected" error, not a code bug
  }
}


module.exports = AppError;
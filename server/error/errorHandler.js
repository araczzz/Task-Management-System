// Error (parent) ErrorHandler (child)
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    // "super" to pass message to the parent class (Error)
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

// used "static" so that we can export it
module.exports = ErrorHandler;

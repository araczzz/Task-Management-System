// Error Handler Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // if (process.env.NODE_ENV === "development") {
  //   console.log("development hit");
  //   res.status(err.statusCode).json({
  //     success: false,
  //     error: err,
  //     errMessage: errMessage,
  //     stack: err.stack
  //   });
  // }

  // if (process.env.NODE_ENV === "production") {
  //   // making a copy of error
  //   let error = { ...err };

  //   error.message = err.message;

  //   res.status(err.statusCode).json({
  //     success: false,
  //     message: error.message || "Internal Server Error"
  //   });
  // }

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new ErrorHandler(message, 404);
  }

  res.status(err.statusCode).json({
    success: false,
    error: err,
    errMessage: err.message,
    stack: err.stack
  });
};

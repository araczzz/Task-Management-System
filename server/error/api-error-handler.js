const ApiError = require("./errorHandler");

function apiErrorHandler(err, req, res, next) {
  // don't use console.log or console.err because
  // it is not async

  // checks for expected error
  if (err instanceof ApiError) {
    res.status(err.code).json(err.message);
    return;
  }

  // otherwise return generic error
  res.status(500).json({
    message: "Oops! Status code 500 error detected!"
  });
}

module.exports = apiErrorHandler;

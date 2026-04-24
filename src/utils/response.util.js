const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    statusCode,
    error: null,
    message,
    metadata: data,
  });
};

const errorResponse = (res, message = "Error", statusCode = 500, error = "INTERNAL_SERVER_ERROR") => {
  return res.status(statusCode).json({
    statusCode,
    error,
    message,
    metadata: null,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
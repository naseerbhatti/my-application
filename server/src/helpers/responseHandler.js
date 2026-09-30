
export const responseHandler = (res, options) => {
  const {
    statusCode = 200,
    success = true,
    data = null,
    message,
    error,
  } = options;
  const responseMessage = error
    ? error.message || "An error occurred"
    : message || "Success";

  return res.status(statusCode).json({
    status: statusCode,
    success: error ? false : success,
    message: responseMessage,
    data: error ? null : data,
  });
};
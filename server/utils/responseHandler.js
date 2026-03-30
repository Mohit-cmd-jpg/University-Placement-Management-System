/**
 * Response handler utility for the University Placement System.
 * Standardizes the format of all API responses.
 */

const responseHandler = {
  /**
   * Send a success response.
   * @param {Object} res - Express response object.
   * @param {string} message - Success message.
   * @param {Object|Array} [data] - Data to send.
   * @param {number} [statusCode=200] - HTTP status code.
   */
  success: (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Send an error response.
   * Note: Global error handler handles most cases, but this is useful for manual errors.
   * @param {Object} res - Express response object.
   * @param {string} message - Error message.
   * @param {number} [statusCode=500] - HTTP status code.
   * @param {Object} [details] - Extra error details.
   */
  error: (res, message, statusCode = 500, details = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      status: statusCode,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = responseHandler;

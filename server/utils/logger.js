/**
 * Logger utility for the University Placement System.
 * Provides a standardized way to log messages with different severity levels.
 * Can be easily integrated with external logging services in the future.
 */

const isProduction = process.env.NODE_ENV === 'production';

const logger = {
  /**
   * Log informative messages.
   * @param {string} message - The message to log.
   * @param {Object} [meta] - Additional metadata.
   */
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, Object.keys(meta).length ? meta : '');
  },

  /**
   * Log warning messages.
   * @param {string} message - The warning message.
   * @param {Object} [meta] - Additional metadata.
   */
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, Object.keys(meta).length ? meta : '');
  },

  /**
   * Log error messages.
   * @param {string|Error} error - The error object or message.
   * @param {Object} [meta] - Additional metadata.
   */
  error: (error, meta = {}) => {
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : null;
    
    console.error(`[${timestamp}] [ERROR] ${message}`, {
      ...meta,
      ...(stack && !isProduction ? { stack } : {})
    });
  },

  /**
   * Log security-related events.
   * @param {string} message - Security event description.
   * @param {Object} [meta] - Contextual data (IP, User ID, etc).
   */
  security: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [SECURITY] 🛡️ ${message}`, meta);
  }
};

module.exports = logger;

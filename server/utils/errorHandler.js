/**
 * Error Handler Utilities for Consistent Response Format
 * Standardizes error responses across all endpoints
 */

// Standard error response format
const createErrorResponse = (status, message, details = null, errorId = null) => {
    const response = {
        success: false,
        message: message,
        status: status
    };
    
    if (details) {
        response.details = details;
    }
    
    if (errorId) {
        response.errorId = errorId;
    }
    
    return response;
};

// Generate unique error ID for tracking
const generateErrorId = () => {
    return `ERR_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};

// Centralized error response handler
const sendErrorResponse = (res, statusCode, message, details = null) => {
    const errorId = generateErrorId();
    const response = createErrorResponse(statusCode, message, details, errorId);
    
    // Log error server-side
    if (statusCode >= 500) {
        console.error(`[${errorId}] Server Error (${statusCode}):`, message);
    }
    
    return res.status(statusCode).json(response);
};

// Async error wrapper for routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Common error messages to prevent user enumeration
const SAFE_ERRORS = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User account not found',
    UNAUTHORIZED: 'You do not have permission to access this resource',
    VALIDATION_ERROR: 'Please provide all required fields',
    DATABASE_ERROR: 'An error occurred processing your request',
    NOT_FOUND: 'The requested resource was not found',
    DUPLICATE_ENTRY: 'This entry already exists',
    INVALID_REQUEST: 'Invalid request parameters',
    SERVER_ERROR: 'An error occurred. Please try again later'
};

module.exports = {
    createErrorResponse,
    generateErrorId,
    sendErrorResponse,
    asyncHandler,
    SAFE_ERRORS
};

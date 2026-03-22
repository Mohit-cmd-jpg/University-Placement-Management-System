/**
 * Retry Logic Utility
 * Implements exponential backoff retry mechanism
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute async function with exponential backoff retry
 * @param {Function} fn - Async function to retry
 * @param {Object} options - { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
 * @returns {Promise} Result from function
 */
const withRetry = async (fn, options = {}) => {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 10000,
        label = 'Operation'
    } = options;
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // Don't retry on client errors (4xx) or specific non-retryable errors
            if (error.status >= 400 && error.status < 500) {
                throw error;
            }
            
            // Don't retry on last attempt
            if (attempt === maxRetries) {
                break;
            }
            
            // Calculate exponential backoff delay
            const delay = Math.min(
                baseDelay * Math.pow(2, attempt - 1),
                maxDelay
            );
            
            // Add jitter to prevent thundering herd
            const jitter = Math.random() * 100;
            
            await sleep(delay + jitter);
        }
    }
    
    throw lastError;
};

/**
 * Retry with specific error conditions
 * @param {Function} fn - Async function to retry
 * @param {Function} shouldRetry - Function to check if error is retryable
 * @param {Object} options - Retry options
 */
const withConditionalRetry = async (fn, shouldRetry, options = {}) => {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 10000
    } = options;
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // Check if this error type is retryable
            if (!shouldRetry(error)) {
                throw error;
            }
            
            // Don't retry on last attempt
            if (attempt === maxRetries) {
                break;
            }
            
            // Calculate exponential backoff delay
            const delay = Math.min(
                baseDelay * Math.pow(2, attempt - 1),
                maxDelay
            );
            
            const jitter = Math.random() * 100;
            await sleep(delay + jitter);
        }
    }
    
    throw lastError;
};

/**
 * Timeout wrapper for promises
 * @param {Promise} promise - Promise to wrap
 * @param {Number} ms - Timeout in milliseconds
 * @param {String} label - Error label
 */
const withTimeout = async (promise, ms = 30000, label = 'Operation') => {
    let timeoutHandle;
    
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`${label} timed out after ${ms}ms`));
        }, ms);
    });
    
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutHandle);
    }
};

module.exports = {
    withRetry,
    withConditionalRetry,
    withTimeout,
    sleep
};

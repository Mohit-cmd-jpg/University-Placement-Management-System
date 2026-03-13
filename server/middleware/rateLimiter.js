const rateLimit = require('express-rate-limit');

// Max 3 OTP requests per minute from a single IP/email
const otpRequestLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: { error: 'Too many OTP requests. Please try again after a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Max 5 OTP verification attempts per minute
const otpVerifyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: 'Too many failed attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    otpRequestLimiter,
    otpVerifyLimiter
};

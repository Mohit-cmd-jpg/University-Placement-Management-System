const cors = require('cors');

/**
 * Strict CORS configuration for the University Placement System.
 * Whitelists specific domains for production and local development.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL, // Production domain (e.g., Vercel)
  'http://localhost:5173',   // Local Vite dev server
  'http://localhost:5500',   // Local dev fallback
  'http://127.0.0.1:5173',   // localhost IPv4 variant
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without origin (e.g., mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Reject with descriptive error
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);

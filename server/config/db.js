const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connects to MongoDB Atlas using Mongoose.
 * Implements connection pooling and basic error handling.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true, // Build indexes specified in schemas
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection loss after initial connection
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`, { error: err });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (err) {
    logger.error(`Error connecting to MongoDB: ${err.message}`, { error: err });
    // Exit process with failure if initial connection fails
    process.exit(1);
  }
};

module.exports = connectDB;

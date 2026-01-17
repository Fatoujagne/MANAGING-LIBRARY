/**
 * Express Server Configuration
 * 
 * This is the main entry point for the backend server.
 * It configures Express, connects to MongoDB, sets up middleware,
 * defines routes, and handles errors.
 * 
 * @module server
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

/**
 * Environment Variable Validation
 * 
 * Check for required environment variables before starting the server.
 * JWT_SECRET is critical for authentication - server cannot start without it.
 */
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined in environment variables');
  process.exit(1); // Exit if critical environment variable is missing
}

/**
 * Initialize Express Application
 * 
 * Creates an instance of the Express application.
 * This app will handle all HTTP requests to the server.
 */
const app = express();

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Allows the frontend (running on different port) to make requests to this backend.
 * Configured to accept requests from Angular development server (port 4200)
 * and potential production frontend (port 3000).
 */
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'], // Allowed frontend origins
  credentials: true, // Allow cookies/credentials to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

/**
 * Body Parsing Middleware
 * 
 * These middleware functions parse incoming request bodies.
 * - express.json(): Parses JSON request bodies
 * - express.urlencoded(): Parses URL-encoded request bodies (form data)
 */
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

/**
 * MongoDB Database Connection
 * 
 * Connects to MongoDB Atlas (cloud database) or local MongoDB instance.
 * Uses connection options for optimal performance and error handling.
 * 
 * @async
 * @function connectDB
 */
const connectDB = async () => {
  try {
    // Get MongoDB connection URI from environment variables
    // Falls back to local MongoDB if MONGO_URI is not set
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/library';
    
    /**
     * MongoDB Connection Options
     * 
     * These options configure how the connection behaves:
     * - serverSelectionTimeoutMS: How long to wait before giving up on server selection (5 seconds)
     * - socketTimeoutMS: How long to wait for a socket operation before timing out (45 seconds)
     */
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    // Attempt to connect to MongoDB
    await mongoose.connect(mongoUri, options);
    
    // Connection successful - log success message
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
  } catch (err) {
    // Connection failed - log detailed error information
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check:');
    console.error('  1. Your MONGO_URI in .env file is correct');
    console.error('  2. Your IP address is whitelisted in MongoDB Atlas');
    console.error('  3. Your database user credentials are correct');
    console.error('  4. Network connectivity to MongoDB Atlas');
    console.error('Server will continue to run but database operations will fail');
    // Don't exit - allow server to start even if DB connection fails
    // This allows the server to be started and database issues to be fixed without restart
  }
};

// Call the database connection function
connectDB();

/**
 * API Routes
 * 
 * Mount route handlers for different API endpoints.
 * All routes are prefixed with /api.
 * 
 * Route Structure:
 * - /api/auth - Authentication and user management routes
 * - /api/books - Book management routes
 * - /api/members - Member management routes
 */
app.use('/api/auth', require('./routes/auth.routes')); // Authentication routes
app.use('/api/books', require('./routes/books.routes')); // Book management routes
app.use('/api/members', require('./routes/members.routes')); // Member management routes

/**
 * Health Check Endpoint
 * 
 * Simple endpoint to verify that the server is running.
 * Useful for monitoring and health checks.
 * 
 * @route   GET /api/health
 * @access  Public
 * @returns {Object} Server status
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * 404 Not Found Handler
 * 
 * This middleware catches all requests that don't match any defined routes.
 * Must be placed before the error handling middleware.
 * 
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {void} Sends 404 response
 */
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

/**
 * Global Error Handling Middleware
 * 
 * This middleware catches all errors thrown in route handlers and middleware.
 * It formats error responses consistently and handles different error types.
 * Must be the last middleware in the chain.
 * 
 * @param   {Error} err - Error object
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {void} Sends error response
 */
app.use((err, req, res, next) => {
  // Log error stack trace for debugging
  console.error('Error:', err.stack);
  
  /**
   * Mongoose Validation Error
   * 
   * Occurs when data doesn't match schema validation rules.
   * Extract and return validation error messages.
   */
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }

  /**
   * Mongoose Duplicate Key Error
   * 
   * Occurs when trying to create a document with a duplicate unique field value.
   * Extract the field name and return a user-friendly error message.
   */
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  /**
   * JWT Token Errors
   * 
   * Handle JSON Web Token related errors.
   */
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  /**
   * Default Error Response
   * 
   * For all other errors, return a generic error message.
   * In development mode, include error stack trace for debugging.
   */
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only include error stack in development mode
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

/**
 * Server Port Configuration
 * 
 * Get port from environment variable or use default port 5000.
 * PORT environment variable is typically set by hosting platforms.
 */
const PORT = process.env.PORT || 5000;

/**
 * Start HTTP Server
 * 
 * Creates an HTTP server and starts listening on the configured port.
 * Logs a message when the server is ready to accept connections.
 */
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * Server Error Handler
 * 
 * Handles errors that occur at the server level (e.g., port already in use).
 * Provides helpful error messages and suggestions for resolution.
 */
server.on('error', (err) => {
  // Handle port already in use error
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
    console.error('You can set a different port using: PORT=5001 npm start');
  } else {
    // Handle other server errors
    console.error('Server error:', err);
  }
});

/**
 * Export Express App
 * 
 * Export the app for use in tests or other modules.
 */
module.exports = app;

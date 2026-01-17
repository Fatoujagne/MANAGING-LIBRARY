/**
 * Authentication Middleware
 * 
 * This module provides middleware functions for authentication and authorization:
 * - protect: Verifies JWT tokens and authenticates users
 * - authorize: Checks if user has required role(s) to access a route
 * 
 * @module middleware/auth.middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Protect Routes - JWT Authentication Middleware
 * 
 * Verifies JWT tokens from the Authorization header and attaches the authenticated
 * user to the request object. This middleware must be used before any route that
 * requires authentication.
 * 
 * Token Format: "Bearer <token>"
 * 
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {void} Calls next() if authentication succeeds, sends error response otherwise
 * 
 * @example
 * // Usage in routes:
 * router.get('/protected-route', protect, controller.handler);
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    // Expected format: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Split "Bearer <token>" and get the token part (index 1)
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token provided' 
      });
    }

    try {
      // Verify and decode the JWT token
      // jwt.verify() throws an error if token is invalid or expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID from decoded token
      // select('-password') excludes password from the result
      req.user = await User.findById(decoded.id).select('-password');
      
      // Check if user still exists in database
      // (User might have been deleted after token was issued)
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Authentication successful - proceed to next middleware/route handler
      next();
    } catch (error) {
      // Token verification failed (invalid or expired)
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed' 
      });
    }
  } catch (error) {
    // Pass unexpected errors to error handling middleware
    next(error);
  }
};

/**
 * Authorize by Role - Role-Based Access Control Middleware
 * 
 * Checks if the authenticated user has one of the required roles to access a route.
 * This middleware must be used after the protect middleware (which sets req.user).
 * 
 * @param   {...String} roles - One or more allowed roles (e.g., 'Admin', 'Member')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Usage in routes:
 * router.get('/admin-only', protect, authorize('Admin'), controller.handler);
 * router.get('/admin-or-member', protect, authorize('Admin', 'Member'), controller.handler);
 */
exports.authorize = (...roles) => {
  /**
   * Returns the actual middleware function that will be executed
   * 
   * @param   {Object} req - Express request object (must have req.user from protect middleware)
   * @param   {Object} res - Express response object
   * @param   {Function} next - Express next middleware function
   * @returns {void} Calls next() if authorization succeeds, sends error response otherwise
   */
  return (req, res, next) => {
    // Check if user is authenticated (req.user should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Check if user's role is in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }

    // Authorization successful - proceed to next middleware/route handler
    next();
  };
};

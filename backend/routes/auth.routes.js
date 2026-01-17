/**
 * Auth Routes
 * 
 * This file defines all routes related to authentication and user management.
 * Routes are protected with authentication middleware and some require admin authorization.
 * 
 * @module routes/auth.routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * Registration Validation Rules
 * 
 * Defines validation rules for user registration using express-validator.
 * These rules ensure data integrity before creating new user accounts.
 */
const registerValidation = [
  // Name validation: required, trimmed, minimum 2 characters
  body('name')
    .trim() // Remove leading/trailing whitespace
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  // Email validation: required, trimmed, must be valid email format
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  // Password validation: required, minimum 6 characters
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  // Role validation: optional, must be either 'Admin' or 'Member'
  body('role')
    .optional() // Field is optional
    .isIn(['Admin', 'Member']).withMessage('Role must be either Admin or Member')
];

/**
 * Login Validation Rules
 * 
 * Defines validation rules for user login using express-validator.
 */
const loginValidation = [
  // Email validation: required, trimmed, must be valid email format
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  // Password validation: required
  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Role Update Validation Rules
 * 
 * Defines validation rules for role updates (Admin only).
 */
const roleUpdateValidation = [
  // Role validation: required, must be either 'Admin' or 'Member'
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['Admin', 'Member']).withMessage('Role must be either Admin or Member')
];

/**
 * Route Definitions
 * 
 * All routes are prefixed with /api/auth (defined in server.js)
 */

/**
 * POST /api/auth/register
 * 
 * Register a new user account.
 * Anyone can create an account. New users default to 'Member' role.
 * 
 * Middleware:
 * - registerValidation: Validates request body
 * 
 * @access  Public
 */
router.post('/register', registerValidation, authController.register);

/**
 * POST /api/auth/login
 * 
 * Authenticate user and receive JWT token.
 * Returns a token that must be included in Authorization header for protected routes.
 * 
 * Middleware:
 * - loginValidation: Validates request body
 * 
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

/**
 * GET /api/auth/profile
 * 
 * Get current authenticated user's profile.
 * Returns information about the user making the request.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * 
 * @access  Private (Any authenticated user)
 */
router.get('/profile', protect, authController.getProfile);

/**
 * GET /api/auth/users
 * 
 * Get all users in the system (Admin only).
 * Returns a list of all registered users for administrative purposes.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * 
 * @access  Private (Admin only)
 */
router.get('/users', protect, authorize('Admin'), authController.getAllUsers);

/**
 * GET /api/auth/users/:id
 * 
 * Get a single user by ID (Admin only).
 * Returns detailed information about a specific user.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * 
 * @access  Private (Admin only)
 */
router.get('/users/:id', protect, authorize('Admin'), authController.getUserById);

/**
 * PUT /api/auth/users/:id/role
 * 
 * Update a user's role (Admin only).
 * Allows admins to promote members to admins or demote admins to members.
 * Admins cannot change their own role.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * - roleUpdateValidation: Validates request body
 * 
 * @access  Private (Admin only)
 */
router.put('/users/:id/role', protect, authorize('Admin'), roleUpdateValidation, authController.updateUserRole);

/**
 * DELETE /api/auth/users/:id
 * 
 * Delete a user account (Admin only).
 * Permanently removes a user from the system.
 * Admins cannot delete their own account.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * 
 * @access  Private (Admin only)
 */
router.delete('/users/:id', protect, authorize('Admin'), authController.deleteUser);

/**
 * Export the router
 * 
 * This router is imported in server.js and mounted at /api/auth
 */
module.exports = router;

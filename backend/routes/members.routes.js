/**
 * Members Routes
 * 
 * This file defines all routes related to member operations.
 * Routes are protected with authentication middleware and some require admin authorization.
 * 
 * @module routes/members.routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const membersController = require('../controllers/members.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * Member Validation Rules
 * 
 * Defines validation rules for member creation and updates using express-validator.
 * These rules ensure data integrity before processing requests.
 */
const memberValidation = [
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
  
  // Membership ID validation: required, trimmed, minimum 1 character
  body('membershipId')
    .trim()
    .notEmpty().withMessage('Membership ID is required')
    .isLength({ min: 1 }).withMessage('Membership ID cannot be empty'),
  
  // Role validation: optional, must be either 'Admin' or 'Member'
  body('role')
    .optional() // Field is optional
    .isIn(['Admin', 'Member']).withMessage('Role must be either Admin or Member'),
  
  // Borrowed books validation: optional, must be an array if provided
  body('borrowedBooks')
    .optional() // Field is optional
    .isArray().withMessage('Borrowed books must be an array')
];

/**
 * Route Definitions
 * 
 * All routes are prefixed with /api/members (defined in server.js)
 */

/**
 * POST /api/members
 * 
 * Create a new library member.
 * Only administrators can create new members.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * - memberValidation: Validates request body
 * 
 * @access  Private (Admin only)
 */
router.post('/', protect, authorize('Admin'), memberValidation, membersController.createMember);

/**
 * GET /api/members
 * 
 * Get all library members.
 * Returns a list of all members with their borrowed books populated.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * 
 * @access  Private (Any authenticated user)
 */
router.get('/', protect, membersController.getMembers);

/**
 * GET /api/members/:id
 * 
 * Get a single member by ID.
 * Returns detailed information about a specific member, including borrowed books.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * 
 * @access  Private (Any authenticated user)
 */
router.get('/:id', protect, membersController.getMember);

/**
 * PUT /api/members/:id
 * 
 * Update a member's information.
 * Only administrators can update member information.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * - memberValidation: Validates request body
 * 
 * @access  Private (Admin only)
 */
router.put('/:id', protect, authorize('Admin'), memberValidation, membersController.updateMember);

/**
 * DELETE /api/members/:id
 * 
 * Delete a member from the system.
 * Only administrators can delete members.
 * This action cannot be undone.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * 
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('Admin'), membersController.deleteMember);

/**
 * Export the router
 * 
 * This router is imported in server.js and mounted at /api/members
 */
module.exports = router;

/**
 * Books Routes
 * 
 * This file defines all routes related to book operations.
 * Routes are protected with authentication middleware and some require admin authorization.
 * 
 * @module routes/books.routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const booksController = require('../controllers/books.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * Book Validation Rules
 * 
 * Defines validation rules for book creation and updates using express-validator.
 * These rules ensure data integrity before processing requests.
 */
const bookValidation = [
  // Title validation: required, trimmed, minimum 1 character
  body('title')
    .trim() // Remove leading/trailing whitespace
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1 }).withMessage('Title cannot be empty'),
  
  // Author validation: required, trimmed, minimum 1 character
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required')
    .isLength({ min: 1 }).withMessage('Author cannot be empty'),
  
  // ISBN validation: required, trimmed, minimum 1 character
  body('ISBN')
    .trim()
    .notEmpty().withMessage('ISBN is required')
    .isLength({ min: 1 }).withMessage('ISBN cannot be empty'),
  
  // Category validation: required, trimmed, minimum 1 character
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ min: 1 }).withMessage('Category cannot be empty'),
  
  // Availability validation: optional, must be boolean if provided
  body('availability')
    .optional() // Field is optional
    .isBoolean().withMessage('Availability must be a boolean')
];

/**
 * Route Definitions
 * 
 * All routes are prefixed with /api/books (defined in server.js)
 */

/**
 * POST /api/books
 * 
 * Create a new book request.
 * Any authenticated user (Member or Admin) can create a book request.
 * The book will be created with 'pending' status and requires admin approval.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - bookValidation: Validates request body
 * 
 * @access  Private (Any authenticated user)
 */
router.post('/', protect, bookValidation, booksController.createBook);

/**
 * GET /api/books
 * 
 * Get all books (filtered by user role).
 * - Regular users: Only see approved books
 * - Admins: See all books (pending, approved, rejected)
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * 
 * @access  Private (Any authenticated user)
 */
router.get('/', protect, booksController.getBooks);

/**
 * GET /api/books/pending
 * 
 * Get all pending book requests (Admin only).
 * This route is used by admins to review book requests that need approval.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * 
 * @access  Private (Admin only)
 */
router.get('/pending', protect, authorize('Admin'), booksController.getPendingBooks);

/**
 * GET /api/books/:id
 * 
 * Get a single book by ID.
 * - Regular users: Can only view approved books
 * - Admins: Can view any book (including pending/rejected)
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * 
 * @access  Private (Any authenticated user)
 */
router.get('/:id', protect, booksController.getBook);

/**
 * PUT /api/books/:id/approve
 * 
 * Approve a pending book request (Admin only).
 * Changes book status from 'pending' to 'approved', making it visible to all users.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * 
 * @access  Private (Admin only)
 */
router.put('/:id/approve', protect, authorize('Admin'), booksController.approveBook);

/**
 * PUT /api/books/:id/reject
 * 
 * Reject a pending book request (Admin only).
 * Changes book status from 'pending' to 'rejected', preventing it from being visible.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * 
 * @access  Private (Admin only)
 */
router.put('/:id/reject', protect, authorize('Admin'), booksController.rejectBook);

/**
 * PUT /api/books/:id
 * 
 * Update a book (Admin only).
 * Allows admins to modify book information.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * - bookValidation: Validates request body
 * 
 * @access  Private (Admin only)
 */
router.put('/:id', protect, authorize('Admin'), bookValidation, booksController.updateBook);

/**
 * DELETE /api/books/:id
 * 
 * Delete a book (Admin only).
 * Permanently removes a book from the database.
 * 
 * Middleware:
 * - protect: Ensures user is authenticated
 * - authorize('Admin'): Ensures user has Admin role
 * 
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('Admin'), booksController.deleteBook);

/**
 * Export the router
 * 
 * This router is imported in server.js and mounted at /api/books
 */
module.exports = router;

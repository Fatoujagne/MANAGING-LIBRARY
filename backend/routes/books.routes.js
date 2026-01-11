const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const booksController = require('../controllers/books.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Validation rules
const bookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required')
    .isLength({ min: 1 }).withMessage('Author cannot be empty'),
  body('ISBN')
    .trim()
    .notEmpty().withMessage('ISBN is required')
    .isLength({ min: 1 }).withMessage('ISBN cannot be empty'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ min: 1 }).withMessage('Category cannot be empty'),
  body('availability')
    .optional()
    .isBoolean().withMessage('Availability must be a boolean')
];

// Routes
router.post('/', protect, authorize('Admin'), bookValidation, booksController.createBook);
router.get('/', protect, booksController.getBooks);
router.get('/:id', protect, booksController.getBook);
router.put('/:id', protect, authorize('Admin'), bookValidation, booksController.updateBook);
router.delete('/:id', protect, authorize('Admin'), booksController.deleteBook);

module.exports = router;

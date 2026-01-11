const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const membersController = require('../controllers/members.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Validation rules
const memberValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('membershipId')
    .trim()
    .notEmpty().withMessage('Membership ID is required')
    .isLength({ min: 1 }).withMessage('Membership ID cannot be empty'),
  body('role')
    .optional()
    .isIn(['Admin', 'Member']).withMessage('Role must be either Admin or Member'),
  body('borrowedBooks')
    .optional()
    .isArray().withMessage('Borrowed books must be an array')
];

// Routes
router.post('/', protect, authorize('Admin'), memberValidation, membersController.createMember);
router.get('/', protect, membersController.getMembers);
router.get('/:id', protect, membersController.getMember);
router.put('/:id', protect, authorize('Admin'), memberValidation, membersController.updateMember);
router.delete('/:id', protect, authorize('Admin'), membersController.deleteMember);

module.exports = router;

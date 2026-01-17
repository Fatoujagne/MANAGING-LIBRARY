/**
 * Members Controller
 * 
 * This controller handles all member-related operations including:
 * - Creating new members (Admin only)
 * - Viewing members and their borrowed books
 * - Updating member information (Admin only)
 * - Deleting members (Admin only)
 * 
 * @module controllers/members.controller
 */

const Member = require('../models/Member.model');
const { validationResult } = require('express-validator');

/**
 * Create a new member
 * 
 * Allows administrators to create new library members.
 * Members can borrow books and have a unique membership ID.
 * 
 * @route   POST /api/members
 * @access  Private (Admin only)
 * @param   {Object} req.body - Member data (name, email, membershipId, role, borrowedBooks)
 * @returns {Object} Created member
 */
exports.createMember = async (req, res, next) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Create new member in database
    const member = await Member.create(req.body);
    
    // Return success response with created member
    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    // Handle duplicate email or membershipId error (unique constraint violation)
    if (error.code === 11000) {
      // Extract the field name that caused the duplicate error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        message: `Member with this ${field} already exists` 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Get all members
 * 
 * Returns a list of all library members with their borrowed books populated.
 * Accessible by any authenticated user.
 * 
 * @route   GET /api/members
 * @access  Private (Any authenticated user)
 * @returns {Object} List of all members
 */
exports.getMembers = async (req, res, next) => {
  try {
    // Find all members
    // populate('borrowedBooks') replaces ObjectIds with full Book documents
    // Only includes title, author, and ISBN fields from Book documents
    // sort({ createdAt: -1 }) sorts by newest first
    const members = await Member.find()
      .populate('borrowedBooks', 'title author ISBN')
      .sort({ createdAt: -1 });
    
    // Return success response with member list
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    // Pass errors to error handling middleware
    next(error);
  }
};

/**
 * Get single member by ID
 * 
 * Returns detailed information about a specific member, including their borrowed books.
 * 
 * @route   GET /api/members/:id
 * @access  Private (Any authenticated user)
 * @param   {String} req.params.id - Member MongoDB ObjectId
 * @returns {Object} Member details with borrowed books
 */
exports.getMember = async (req, res, next) => {
  try {
    // Find member by ID
    // populate('borrowedBooks') replaces ObjectIds with full Book documents
    // Includes title, author, ISBN, and availability fields from Book documents
    const member = await Member.findById(req.params.id)
      .populate('borrowedBooks', 'title author ISBN availability');
    
    // Check if member exists
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }
    
    // Return success response with member data
    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Update member
 * 
 * Allows administrators to update member information.
 * Can update name, email, membershipId, role, or borrowedBooks.
 * 
 * @route   PUT /api/members/:id
 * @access  Private (Admin only)
 * @param   {String} req.params.id - Member MongoDB ObjectId
 * @param   {Object} req.body - Updated member data
 * @returns {Object} Updated member
 */
exports.updateMember = async (req, res, next) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Check if member exists
    let member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }

    // Update member with new data
    // new: true returns the updated document instead of the original
    // runValidators: true ensures schema validators run on update
    // populate('borrowedBooks') populates the borrowedBooks field with Book documents
    member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('borrowedBooks', 'title author ISBN');
    
    // Return success response with updated member
    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }
    // Handle duplicate email or membershipId error (unique constraint violation)
    if (error.code === 11000) {
      // Extract the field name that caused the duplicate error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        message: `Member with this ${field} already exists` 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Delete member
 * 
 * Permanently removes a member from the database.
 * This action cannot be undone.
 * 
 * @route   DELETE /api/members/:id
 * @access  Private (Admin only)
 * @param   {String} req.params.id - Member MongoDB ObjectId
 * @returns {Object} Success message
 */
exports.deleteMember = async (req, res, next) => {
  try {
    // Check if member exists before attempting to delete
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }

    // Permanently delete member from database
    await Member.findByIdAndDelete(req.params.id);
    
    // Return success response
    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

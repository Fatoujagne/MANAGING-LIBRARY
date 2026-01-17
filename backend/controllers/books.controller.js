/**
 * Books Controller
 * 
 * This controller handles all book-related operations including:
 * - Creating book requests (any authenticated user)
 * - Viewing books (filtered by approval status)
 * - Admin approval/rejection of book requests
 * - Updating and deleting books (admin only)
 * 
 * @module controllers/books.controller
 */

const Book = require('../models/Book.model');
const { validationResult } = require('express-validator');

/**
 * Create a new book request
 * 
 * Allows any authenticated user (Member or Admin) to create a book request.
 * The book will be created with 'pending' approval status and will not be
 * visible to regular users until an admin approves it.
 * 
 * @route   POST /api/books
 * @access  Private (Any authenticated user)
 * @param   {Object} req.body - Book data (title, author, ISBN, category, availability)
 * @param   {Object} req.user - Authenticated user (from protect middleware)
 * @returns {Object} Created book with pending status
 */
exports.createBook = async (req, res, next) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Create book with requestedBy set to current user's ID
    // approvalStatus defaults to 'pending' as defined in the model
    const book = await Book.create({
      ...req.body, // Spread all book data from request body
      requestedBy: req.user._id // Set the user who requested this book
    });
    
    // Populate the requestedBy field with user details for response
    await book.populate('requestedBy', 'name email');
    
    // Return success response with created book
    res.status(201).json({
      success: true,
      message: 'Book request created successfully. Waiting for admin approval.',
      data: book
    });
  } catch (error) {
    // Handle duplicate ISBN error (unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Book with this ISBN already exists' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Get all books (filtered by user role)
 * 
 * - Regular users (Members): Only see approved books
 * - Admins: See all books (pending, approved, rejected)
 * 
 * @route   GET /api/books
 * @access  Private (Any authenticated user)
 * @param   {Object} req.user - Authenticated user (from protect middleware)
 * @returns {Object} List of books (filtered based on user role)
 */
exports.getBooks = async (req, res, next) => {
  try {
    let books;
    
    // Check if user is an admin
    if (req.user.role === 'Admin') {
      // Admins can see all books regardless of approval status
      // Populate requestedBy and reviewedBy with user details
      books = await Book.find()
        .populate('requestedBy', 'name email')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 }); // Sort by newest first
    } else {
      // Regular members only see approved books
      books = await Book.find({ approvalStatus: 'approved' })
        .populate('requestedBy', 'name email')
        .sort({ createdAt: -1 }); // Sort by newest first
    }
    
    // Return success response with book list
    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    // Pass errors to error handling middleware
    next(error);
  }
};

/**
 * Get pending book requests (Admin only)
 * 
 * Returns all books that are waiting for admin approval.
 * This endpoint is used by admins to review book requests.
 * 
 * @route   GET /api/books/pending
 * @access  Private (Admin only)
 * @returns {Object} List of pending book requests
 */
exports.getPendingBooks = async (req, res, next) => {
  try {
    // Find all books with pending approval status
    // Populate requestedBy to show who requested each book
    const books = await Book.find({ approvalStatus: 'pending' })
      .populate('requestedBy', 'name email role')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Return success response with pending books
    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    // Pass errors to error handling middleware
    next(error);
  }
};

/**
 * Get single book by ID
 * 
 * Returns a specific book by its ID. Access rules:
 * - Regular users: Can only view approved books
 * - Admins: Can view any book (including pending/rejected)
 * 
 * @route   GET /api/books/:id
 * @access  Private (Any authenticated user)
 * @param   {String} req.params.id - Book MongoDB ObjectId
 * @param   {Object} req.user - Authenticated user (from protect middleware)
 * @returns {Object} Book details
 */
exports.getBook = async (req, res, next) => {
  try {
    // Find book by ID and populate user references
    let book = await Book.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email');
    
    // Check if book exists
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Check if user has permission to view this book
    // Regular users can only see approved books
    if (req.user.role !== 'Admin' && book.approvalStatus !== 'approved') {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to view this book' 
      });
    }
    
    // Return success response with book details
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Approve a book request (Admin only)
 * 
 * Changes a book's approval status from 'pending' to 'approved',
 * making it visible to all users. Records which admin approved it.
 * 
 * @route   PUT /api/books/:id/approve
 * @access  Private (Admin only)
 * @param   {String} req.params.id - Book MongoDB ObjectId
 * @param   {Object} req.user - Authenticated admin user (from protect middleware)
 * @returns {Object} Updated book with approved status
 */
exports.approveBook = async (req, res, next) => {
  try {
    // Find the book by ID
    const book = await Book.findById(req.params.id);
    
    // Check if book exists
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Check if book is already approved
    if (book.approvalStatus === 'approved') {
      return res.status(400).json({ 
        success: false,
        message: 'Book is already approved' 
      });
    }
    
    // Update book: set approval status to approved, record reviewer and timestamp
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'approved',
        reviewedBy: req.user._id, // Record which admin approved it
        reviewedAt: new Date() // Record when it was approved
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).populate('requestedBy', 'name email')
     .populate('reviewedBy', 'name email');
    
    // Return success response
    res.json({
      success: true,
      message: 'Book approved successfully',
      data: updatedBook
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Reject a book request (Admin only)
 * 
 * Changes a book's approval status from 'pending' to 'rejected',
 * preventing it from being visible to regular users. Records which admin rejected it.
 * 
 * @route   PUT /api/books/:id/reject
 * @access  Private (Admin only)
 * @param   {String} req.params.id - Book MongoDB ObjectId
 * @param   {Object} req.user - Authenticated admin user (from protect middleware)
 * @param   {String} req.body.reason - Optional reason for rejection
 * @returns {Object} Updated book with rejected status
 */
exports.rejectBook = async (req, res, next) => {
  try {
    // Find the book by ID
    const book = await Book.findById(req.params.id);
    
    // Check if book exists
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    // Check if book is already rejected
    if (book.approvalStatus === 'rejected') {
      return res.status(400).json({ 
        success: false,
        message: 'Book is already rejected' 
      });
    }
    
    // Update book: set approval status to rejected, record reviewer and timestamp
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'rejected',
        reviewedBy: req.user._id, // Record which admin rejected it
        reviewedAt: new Date() // Record when it was rejected
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).populate('requestedBy', 'name email')
     .populate('reviewedBy', 'name email');
    
    // Return success response
    res.json({
      success: true,
      message: 'Book rejected successfully',
      data: updatedBook
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Update book (Admin only)
 * 
 * Allows admins to update book information. This can be used to:
 * - Edit book details (title, author, ISBN, category, availability)
 * - Change approval status manually if needed
 * 
 * @route   PUT /api/books/:id
 * @access  Private (Admin only)
 * @param   {String} req.params.id - Book MongoDB ObjectId
 * @param   {Object} req.body - Updated book data
 * @returns {Object} Updated book
 */
exports.updateBook = async (req, res, next) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Check if book exists
    let book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    // Update book with new data
    // new: true returns the updated document instead of the original
    // runValidators: true ensures schema validators run on update
    book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('requestedBy', 'name email')
     .populate('reviewedBy', 'name email');
    
    // Return success response with updated book
    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    // Handle duplicate ISBN error (unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Book with this ISBN already exists' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Delete book (Admin only)
 * 
 * Permanently removes a book from the database.
 * This action cannot be undone.
 * 
 * @route   DELETE /api/books/:id
 * @access  Private (Admin only)
 * @param   {String} req.params.id - Book MongoDB ObjectId
 * @returns {Object} Success message
 */
exports.deleteBook = async (req, res, next) => {
  try {
    // Check if book exists before attempting to delete
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    // Permanently delete the book from database
    await Book.findByIdAndDelete(req.params.id);
    
    // Return success response
    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

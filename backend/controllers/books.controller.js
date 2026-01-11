const Book = require('../models/Book.model');
const { validationResult } = require('express-validator');

// @desc    Create a new book
// @route   POST /api/books
// @access  Private (Admin only)
exports.createBook = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.create(req.body);
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Book with this ISBN already exists' 
      });
    }
    next(error);
  }
};

// @desc    Get all books
// @route   GET /api/books
// @access  Private
exports.getBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Private
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin only)
exports.updateBook = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Book with this ISBN already exists' 
      });
    }
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin only)
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }
    next(error);
  }
};

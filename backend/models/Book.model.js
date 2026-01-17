/**
 * Book Model
 * 
 * This model defines the schema for books in the library system.
 * Books can be created by any authenticated user but require admin approval
 * before they become visible to all users.
 * 
 * @module models/Book.model
 */

const mongoose = require('mongoose');

/**
 * Book Schema Definition
 * 
 * Defines the structure and validation rules for book documents in MongoDB.
 * Includes fields for book information, approval status, and tracking who requested the book.
 */
const bookSchema = new mongoose.Schema({
  // Book title - required field, trimmed of whitespace
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true // Remove leading/trailing whitespace
  },
  
  // Book author - required field, trimmed of whitespace
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  
  // International Standard Book Number - must be unique across all books
  ISBN: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true, // Ensures no duplicate ISBNs
    trim: true
  },
  
  // Book category/genre - required field
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  
  // Availability status - whether the book is currently available for borrowing
  availability: {
    type: Boolean,
    default: true // Default to available when created
  },
  
  // Approval status - determines if the book is visible to all users
  // 'pending': Book was created but not yet approved by admin
  // 'approved': Book has been approved by admin and is visible to all
  // 'rejected': Book was rejected by admin
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // Only allow these three values
    default: 'pending' // New books start as pending approval
  },
  
  // Reference to the user who requested/created this book
  // Stores the MongoDB ObjectId of the User document
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: 'User', // Model name for population
    required: true // Every book must have a requester
  },
  
  // Reference to the admin who approved/rejected this book (if applicable)
  // Optional - only set when admin takes action
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: 'User', // Model name for population
    default: null // Not set until admin reviews
  },
  
  // Timestamp when the book was approved/rejected (if applicable)
  reviewedAt: {
    type: Date,
    default: null // Not set until admin reviews
  }
}, {
  // Enable automatic timestamps (createdAt and updatedAt)
  timestamps: true
});

/**
 * Export the Book model
 * 
 * This creates a Mongoose model named 'Book' using the bookSchema.
 * The model is used to interact with the 'books' collection in MongoDB.
 */
module.exports = mongoose.model('Book', bookSchema);

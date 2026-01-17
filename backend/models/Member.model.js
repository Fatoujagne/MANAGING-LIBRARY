/**
 * Member Model
 * 
 * This model defines the schema for library members.
 * Members can borrow books and have a unique membership ID.
 * Note: This is separate from the User model which handles authentication.
 * 
 * @module models/Member.model
 */

const mongoose = require('mongoose');

/**
 * Member Schema Definition
 * 
 * Defines the structure and validation rules for member documents in MongoDB.
 * Includes fields for member information, membership tracking, and borrowed books.
 */
const memberSchema = new mongoose.Schema({
  // Member's full name - required field, trimmed of whitespace
  name: {
    type: String,
    required: [true, 'Name is required'], // Custom error message if missing
    trim: true // Remove leading/trailing whitespace
  },
  
  // Member's email address - must be unique, validated format, stored in lowercase
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Ensures no duplicate emails
    lowercase: true, // Convert to lowercase before saving
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] // Email format validation
  },
  
  // Unique membership identifier - required, must be unique across all members
  membershipId: {
    type: String,
    required: [true, 'Membership ID is required'],
    unique: true, // Ensures no duplicate membership IDs
    trim: true
  },
  
  // Member's role - determines access level and permissions
  role: {
    type: String,
    enum: ['Admin', 'Member'], // Only allow these two values
    default: 'Member' // New members default to Member role
  },
  
  // Array of borrowed books - references to Book documents
  borrowedBooks: [{
    type: mongoose.Schema.Types.ObjectId, // Reference to Book model
    ref: 'Book' // Model name for population
    // When populated, this will contain full Book documents
  }]
}, {
  // Enable automatic timestamps (createdAt and updatedAt)
  timestamps: true
});

/**
 * Export the Member model
 * 
 * This creates a Mongoose model named 'Member' using the memberSchema.
 * The model is used to interact with the 'members' collection in MongoDB.
 */
module.exports = mongoose.model('Member', memberSchema);

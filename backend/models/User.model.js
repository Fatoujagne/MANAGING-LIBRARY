/**
 * User Model
 * 
 * This model defines the schema for users in the library system.
 * Users can be either 'Admin' or 'Member' and are used for authentication
 * and authorization throughout the application.
 * 
 * @module models/User.model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Library for password hashing

/**
 * User Schema Definition
 * 
 * Defines the structure and validation rules for user documents in MongoDB.
 * Includes fields for user information, authentication, and role-based access control.
 */
const userSchema = new mongoose.Schema({
  // User's full name - required field, trimmed of whitespace
  name: {
    type: String,
    required: [true, 'Name is required'], // Custom error message if missing
    trim: true // Remove leading/trailing whitespace
  },
  
  // User's email address - must be unique, validated format, stored in lowercase
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Ensures no duplicate emails
    lowercase: true, // Convert to lowercase before saving
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] // Email format validation
  },
  
  // User's password - will be hashed before saving
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'] // Minimum length validation
  },
  
  // User's role - determines access level and permissions
  role: {
    type: String,
    enum: ['Admin', 'Member'], // Only allow these two values
    default: 'Member' // New users default to Member role
  }
}, {
  // Enable automatic timestamps (createdAt and updatedAt)
  timestamps: true
});

/**
 * Pre-Save Hook - Password Hashing
 * 
 * Automatically hashes the password before saving the user to the database.
 * Uses bcrypt with a salt rounds of 10 for secure password storage.
 * Only hashes if the password field has been modified (not on every save).
 * 
 * @param   {Function} next - Mongoose next middleware function
 * @returns {void} Calls next() to continue save operation
 */
userSchema.pre('save', async function(next) {
  // Skip hashing if password hasn't been modified
  // This prevents re-hashing already hashed passwords
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt (random data) for password hashing
    // Salt rounds of 10 provides good security vs performance balance
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Continue with the save operation
    next();
  } catch (error) {
    // Pass any errors to the error handler
    next(error);
  }
});

/**
 * Compare Password Method
 * 
 * Compares a candidate password (from login) with the stored hashed password.
 * Uses bcrypt.compare() which securely compares passwords without revealing the hash.
 * 
 * @param   {String} candidatePassword - Password to compare (plain text)
 * @returns {Promise<Boolean>} True if passwords match, false otherwise
 * 
 * @example
 * const user = await User.findOne({ email });
 * const isMatch = await user.comparePassword(password);
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  // bcrypt.compare() handles the comparison securely
  // It extracts the salt from the stored hash and uses it to hash the candidate password
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Remove Password from JSON Output
 * 
 * Overrides the toJSON method to automatically exclude the password field
 * when converting the user document to JSON. This prevents passwords from
 * being accidentally sent in API responses.
 * 
 * @returns {Object} User object without password field
 */
userSchema.methods.toJSON = function() {
  // Convert Mongoose document to plain JavaScript object
  const obj = this.toObject();
  
  // Delete the password field from the object
  delete obj.password;
  
  // Return the object without password
  return obj;
};

/**
 * Export the User model
 * 
 * This creates a Mongoose model named 'User' using the userSchema.
 * The model is used to interact with the 'users' collection in MongoDB.
 */
module.exports = mongoose.model('User', userSchema);

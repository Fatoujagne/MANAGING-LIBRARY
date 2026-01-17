/**
 * Auth Controller
 * 
 * This controller handles all authentication and user management operations including:
 * - User registration and login
 * - JWT token generation
 * - User profile retrieval
 * - Role management (Admin only)
 * 
 * @module controllers/auth.controller
 */

const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * Generate JWT Token
 * 
 * Creates a JSON Web Token for authenticated users.
 * Tokens are signed with the JWT_SECRET from environment variables
 * and expire after 30 days.
 * 
 * @param   {String} id - User MongoDB ObjectId
 * @returns {String} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token expires after 30 days
  });
};

/**
 * Register a new user
 * 
 * Allows anyone to create a new user account.
 * New users are created with 'Member' role by default.
 * Only admins can assign 'Admin' role during registration (or via role management).
 * 
 * @route   POST /api/auth/register
 * @access  Public
 * @param   {String} req.body.name - User's full name
 * @param   {String} req.body.email - User's email address (must be unique)
 * @param   {String} req.body.password - User's password (min 6 characters)
 * @param   {String} req.body.role - Optional role ('Admin' or 'Member', defaults to 'Member')
 * @returns {Object} JWT token and user data
 */
exports.register = async (req, res, next) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Extract user data from request body
    const { name, email, password, role } = req.body;

    // Check if user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Create new user in database
    // Password will be automatically hashed by User model pre-save hook
    // Role defaults to 'Member' if not provided
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Member' // Default to Member role
    });

    // Generate JWT token for the new user
    const token = generateToken(user._id);

    // Return success response with token and user data (password excluded automatically)
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Handle duplicate email error (unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Login user
 * 
 * Authenticates a user with email and password.
 * Returns a JWT token that can be used for subsequent authenticated requests.
 * 
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {String} req.body.email - User's email address
 * @param   {String} req.body.password - User's password
 * @returns {Object} JWT token and user data
 */
exports.login = async (req, res, next) => {
  try {
    // Validate request body using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Extract credentials from request body
    const { email, password } = req.body;

    // Find user by email
    // select('+password') is needed because password is excluded by default in User model
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password using bcrypt comparison
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token for authenticated user
    const token = generateToken(user._id);

    // Return success response with token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Pass errors to error handling middleware
    next(error);
  }
};

/**
 * Get current logged in user profile
 * 
 * Returns the profile information of the currently authenticated user.
 * The user object is already populated by the protect middleware.
 * 
 * @route   GET /api/auth/profile
 * @access  Private (Any authenticated user)
 * @param   {Object} req.user - Authenticated user (from protect middleware)
 * @returns {Object} User profile data
 */
exports.getProfile = async (req, res, next) => {
  try {
    // req.user is already populated by the protect middleware
    // No need to query database again
    const user = req.user;
    
    // Return user profile (password is automatically excluded by User model)
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    // Pass errors to error handling middleware
    next(error);
  }
};

/**
 * Get all users (Admin only)
 * 
 * Returns a list of all users in the system.
 * Only accessible by administrators for user management purposes.
 * 
 * @route   GET /api/auth/users
 * @access  Private (Admin only)
 * @returns {Object} List of all users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Find all users, excluding password field
    // Sort by creation date (newest first)
    const users = await User.find()
      .select('-password') // Exclude password from results
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Return success response with user list
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    // Pass errors to error handling middleware
    next(error);
  }
};

/**
 * Get single user by ID (Admin only)
 * 
 * Returns detailed information about a specific user.
 * Only accessible by administrators.
 * 
 * @route   GET /api/auth/users/:id
 * @access  Private (Admin only)
 * @param   {String} req.params.id - User MongoDB ObjectId
 * @returns {Object} User details
 */
exports.getUserById = async (req, res, next) => {
  try {
    // Find user by ID, excluding password field
    const user = await User.findById(req.params.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Return success response with user data
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Update user role (Admin only)
 * 
 * Allows administrators to change a user's role.
 * This is used to promote members to admins or demote admins to members.
 * 
 * @route   PUT /api/auth/users/:id/role
 * @access  Private (Admin only)
 * @param   {String} req.params.id - User MongoDB ObjectId
 * @param   {String} req.body.role - New role ('Admin' or 'Member')
 * @returns {Object} Updated user data
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Extract new role from request body
    const { role } = req.body;

    // Validate role value
    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Role must be either "Admin" or "Member"' 
      });
    }

    // Find user by ID
    const user = await User.findById(req.params.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prevent admin from changing their own role (safety measure)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot change your own role' 
      });
    }

    // Update user role
    user.role = role;
    await user.save();

    // Return success response with updated user (password excluded automatically)
    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

/**
 * Delete user (Admin only)
 * 
 * Permanently removes a user from the system.
 * This action cannot be undone.
 * 
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin only)
 * @param   {String} req.params.id - User MongoDB ObjectId
 * @returns {Object} Success message
 */
exports.deleteUser = async (req, res, next) => {
  try {
    // Find user by ID
    const user = await User.findById(req.params.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prevent admin from deleting themselves (safety measure)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot delete your own account' 
      });
    }

    // Permanently delete user from database
    await User.findByIdAndDelete(req.params.id);
    
    // Return success response
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    // Pass other errors to error handling middleware
    next(error);
  }
};

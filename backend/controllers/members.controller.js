const Member = require('../models/Member.model');
const { validationResult } = require('express-validator');

// @desc    Create a new member
// @route   POST /api/members
// @access  Private (Admin only)
exports.createMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await Member.create(req.body);
    
    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        message: `Member with this ${field} already exists` 
      });
    }
    next(error);
  }
};

// @desc    Get all members
// @route   GET /api/members
// @access  Private
exports.getMembers = async (req, res, next) => {
  try {
    const members = await Member.find()
      .populate('borrowedBooks', 'title author ISBN')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single member by ID
// @route   GET /api/members/:id
// @access  Private
exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('borrowedBooks', 'title author ISBN availability');
    
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }
    
    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }
    next(error);
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private (Admin only)
exports.updateMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }

    member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('borrowedBooks', 'title author ISBN');
    
    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        message: `Member with this ${field} already exists` 
      });
    }
    next(error);
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private (Admin only)
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }

    await Member.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
    }
    next(error);
  }
};

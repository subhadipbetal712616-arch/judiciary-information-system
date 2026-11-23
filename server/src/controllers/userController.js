/**
 * User controller — admin-only CRUD over user accounts.
 */
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Get all users (admin only).
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-password');
  res.json(users);
});

/**
 * @desc    Get a single user.
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  res.json(user);
});

/**
 * @desc    Update a user (role, active, profile fields).
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  const fields = [
    'name',
    'role',
    'barNumber',
    'employeeId',
    'phone',
    'specialization',
    'court',
    'isActive',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });
  // Optionally update email too.
  if (req.body.email) user.email = req.body.email;
  const updated = await user.save();
  res.json(updated.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }));
});

/**
 * @desc    Delete a user.
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  // Prevent the only admin from deleting themselves and locking the system.
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error('Cannot delete the last active admin account.');
    }
  }
  await user.deleteOne();
  res.json({ message: 'User removed.' });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };

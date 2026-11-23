/**
 * Auth controller — register, login, and current user lookup.
 */
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Generate a signed JWT for a user id.
 * @param {string} id
 * @returns {string}
 */
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * @desc    Register a new user. The very first user in the system
 *          is automatically promoted to admin so the system can bootstrap.
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    barNumber,
    employeeId,
    phone,
    specialization,
    court,
  } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('Email already registered.');
  }

  const userCount = await User.countDocuments();
  // First user is always admin so the system is bootstrappable.
  const assignedRole = userCount === 0 ? 'admin' : role || 'lawyer';

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    barNumber,
    employeeId,
    phone,
    specialization,
    court,
  });

  const token = signToken(user._id);
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    barNumber: user.barNumber,
    employeeId: user.employeeId,
    specialization: user.specialization,
    court: user.court,
    token,
  });
});

/**
 * @desc    Authenticate user and return JWT.
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is deactivated. Contact admin.');
  }

  const token = signToken(user._id);
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    barNumber: user.barNumber,
    employeeId: user.employeeId,
    phone: user.phone,
    specialization: user.specialization,
    court: user.court,
    token,
  });
});

/**
 * @desc    Get the currently authenticated user (from JWT).
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { register, login, getMe };

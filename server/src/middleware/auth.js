/**
 * Authentication middleware.
 *
 *  - `protect`     : verifies a JWT bearer token, attaches req.user
 *  - `requireRole` : role-based gate, returns 403 if role not allowed
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify the JWT in the Authorization header and load the user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function protect(req, res, next) {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed.' });
  }
}

/**
 * Build a middleware that restricts a route to the given roles.
 * @param  {...string} roles - e.g. 'admin', 'judge'
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Forbidden: requires one of [${roles.join(', ')}].` });
    }
    next();
  };
}

module.exports = { protect, requireRole };

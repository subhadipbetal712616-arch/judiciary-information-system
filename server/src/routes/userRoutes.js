/**
 * User routes — /api/users (admin only)
 */
const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.route('/').get(getUsers);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;

/**
 * Hearing routes — /api/hearings
 */
const express = require('express');
const {
  getHearings,
  getHearingById,
  createHearing,
  updateHearing,
  deleteHearing,
} = require('../controllers/hearingController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getHearings).post(protect, requireRole('judge', 'registrar', 'admin'), createHearing);
router
  .route('/:id')
  .get(protect, getHearingById)
  .put(protect, requireRole('judge', 'registrar', 'admin'), updateHearing)
  .delete(protect, requireRole('admin'), deleteHearing);

module.exports = router;

/**
 * Dashboard routes — /api/dashboard
 */
const express = require('express');
const {
  getStats,
  getUpcomingHearings,
  getRecentCases,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/upcoming-hearings', getUpcomingHearings);
router.get('/recent-cases', getRecentCases);

module.exports = router;

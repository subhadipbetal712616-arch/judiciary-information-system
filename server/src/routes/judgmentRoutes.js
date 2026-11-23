/**
 * Judgment routes — /api/judgments
 */
const express = require('express');
const {
  getJudgments,
  getJudgmentById,
  createJudgment,
  updateJudgment,
  deleteJudgment,
} = require('../controllers/judgmentController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getJudgments).post(protect, requireRole('judge', 'admin'), createJudgment);
router
  .route('/:id')
  .get(protect, getJudgmentById)
  .put(protect, requireRole('judge', 'admin'), updateJudgment)
  .delete(protect, requireRole('admin'), deleteJudgment);

module.exports = router;

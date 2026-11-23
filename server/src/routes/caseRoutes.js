/**
 * Case routes — /api/cases
 */
const express = require('express');
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getCases).post(protect, requireRole('judge', 'registrar', 'admin'), createCase);
router
  .route('/:id')
  .get(protect, getCaseById)
  .put(protect, requireRole('judge', 'registrar', 'admin'), updateCase)
  .delete(protect, requireRole('admin'), deleteCase);

module.exports = router;

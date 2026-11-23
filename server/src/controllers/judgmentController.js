/**
 * Judgment controller — CRUD + listing by search/verdict/case.
 */
const asyncHandler = require('express-async-handler');
const Judgment = require('../models/Judgment');
const Case = require('../models/Case');

/**
 * @desc    Get judgments. Filters: ?search=, ?verdict=, ?caseId=
 * @route   GET /api/judgments
 * @access  Private
 */
const getJudgments = asyncHandler(async (req, res) => {
  const { search, verdict, caseId } = req.query;
  const filter = {};
  if (verdict) filter.verdict = verdict;
  if (caseId) filter.case = caseId;
  if (search) {
    const rx = new RegExp(search, 'i');
    filter.$or = [{ summary: rx }, { fullText: rx }, { sentenceOrRelief: rx }];
  }
  const judgments = await Judgment.find(filter)
    .populate({
      path: 'case',
      select: 'caseNumber title caseType plaintiff defendant',
    })
    .populate('judge', 'name email specialization')
    .sort({ judgmentDate: -1 });
  res.json(judgments);
});

/**
 * @desc    Get a single judgment by id.
 * @route   GET /api/judgments/:id
 * @access  Private
 */
const getJudgmentById = asyncHandler(async (req, res) => {
  const judgment = await Judgment.findById(req.params.id)
    .populate('case')
    .populate('judge', 'name email specialization court');
  if (!judgment) {
    res.status(404);
    throw new Error('Judgment not found.');
  }
  res.json(judgment);
});

/**
 * @desc    Create a judgment. Enforces one-per-case uniqueness and
 *          marks the parent case as Disposed when a judgment is recorded.
 * @route   POST /api/judgments
 * @access  Private (judge, admin)
 */
const createJudgment = asyncHandler(async (req, res) => {
  const { case: caseId, judge, judgmentDate, verdict, summary, fullText, sentenceOrRelief } =
    req.body;
  if (!caseId || !verdict || !summary) {
    res.status(400);
    throw new Error('caseId, verdict, summary are required.');
  }
  const existing = await Judgment.findOne({ case: caseId });
  if (existing) {
    res.status(409);
    throw new Error('A judgment already exists for this case.');
  }
  const parentCase = await Case.findById(caseId);
  if (!parentCase) {
    res.status(404);
    throw new Error('Referenced case not found.');
  }
  const judgment = await Judgment.create({
    case: caseId,
    judge: judge || req.user._id,
    judgmentDate,
    verdict,
    summary,
    fullText,
    sentenceOrRelief,
  });
  // Auto-transition the case status now that it has been decided.
  parentCase.status = 'Disposed';
  await parentCase.save();
  res.status(201).json(judgment);
});

/**
 * @desc    Update a judgment.
 * @route   PUT /api/judgments/:id
 * @access  Private (judge, admin)
 */
const updateJudgment = asyncHandler(async (req, res) => {
  const judgment = await Judgment.findById(req.params.id);
  if (!judgment) {
    res.status(404);
    throw new Error('Judgment not found.');
  }
  ['case', 'judge', 'judgmentDate', 'verdict', 'summary', 'fullText', 'sentenceOrRelief'].forEach(
    (f) => {
      if (req.body[f] !== undefined) judgment[f] = req.body[f];
    }
  );
  const updated = await judgment.save();
  res.json(updated);
});

/**
 * @desc    Delete a judgment.
 * @route   DELETE /api/judgments/:id
 * @access  Private (admin only)
 */
const deleteJudgment = asyncHandler(async (req, res) => {
  const judgment = await Judgment.findById(req.params.id);
  if (!judgment) {
    res.status(404);
    throw new Error('Judgment not found.');
  }
  await judgment.deleteOne();
  res.json({ message: 'Judgment removed.' });
});

module.exports = {
  getJudgments,
  getJudgmentById,
  createJudgment,
  updateJudgment,
  deleteJudgment,
};

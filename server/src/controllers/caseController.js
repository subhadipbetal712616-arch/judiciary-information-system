/**
 * Case controller — CRUD + listing with filters/search.
 */
const asyncHandler = require('express-async-handler');
const Case = require('../models/Case');

/**
 * @desc    Get all cases (with optional ?status=, ?type=, ?search=).
 * @route   GET /api/cases
 * @access  Private
 */
const getCases = asyncHandler(async (req, res) => {
  const { status, type, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.caseType = type;
  if (search) {
    // Search across case number, title, plaintiff, defendant.
    const rx = new RegExp(search, 'i');
    filter.$or = [
      { caseNumber: rx },
      { title: rx },
      { plaintiff: rx },
      { defendant: rx },
    ];
  }
  const cases = await Case.find(filter)
    .populate('judge', 'name email specialization')
    .populate('lawyer', 'name email barNumber specialization')
    .populate('registrar', 'name email')
    .sort({ createdAt: -1 });
  res.json(cases);
});

/**
 * @desc    Get a single case by id.
 * @route   GET /api/cases/:id
 * @access  Private
 */
const getCaseById = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id)
    .populate('judge', 'name email specialization court')
    .populate('lawyer', 'name email barNumber specialization')
    .populate('registrar', 'name email');
  if (!caseDoc) {
    res.status(404);
    throw new Error('Case not found.');
  }
  res.json(caseDoc);
});

/**
 * @desc    Create a new case.
 * @route   POST /api/cases
 * @access  Private (judge, registrar, admin)
 */
const createCase = asyncHandler(async (req, res) => {
  const {
    caseNumber,
    title,
    caseType,
    status,
    plaintiff,
    defendant,
    description,
    judge,
    lawyer,
    registrar,
    filingDate,
    nextHearingDate,
    courtRoom,
    priority,
  } = req.body;

  if (!caseNumber || !title || !caseType || !plaintiff || !defendant) {
    res.status(400);
    throw new Error('caseNumber, title, caseType, plaintiff, defendant are required.');
  }

  const exists = await Case.findOne({ caseNumber });
  if (exists) {
    res.status(409);
    throw new Error('Case number already exists.');
  }

  const created = await Case.create({
    caseNumber,
    title,
    caseType,
    status,
    plaintiff,
    defendant,
    description,
    judge,
    lawyer,
    registrar,
    filingDate,
    nextHearingDate,
    courtRoom,
    priority,
  });
  res.status(201).json(created);
});

/**
 * @desc    Update a case.
 * @route   PUT /api/cases/:id
 * @access  Private (judge, registrar, admin)
 */
const updateCase = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id);
  if (!caseDoc) {
    res.status(404);
    throw new Error('Case not found.');
  }
  // Whitelist updatable fields.
  const fields = [
    'caseNumber',
    'title',
    'caseType',
    'status',
    'plaintiff',
    'defendant',
    'description',
    'judge',
    'lawyer',
    'registrar',
    'filingDate',
    'nextHearingDate',
    'courtRoom',
    'priority',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) caseDoc[f] = req.body[f];
  });
  const updated = await caseDoc.save();
  res.json(updated);
});

/**
 * @desc    Delete a case.
 * @route   DELETE /api/cases/:id
 * @access  Private (admin only)
 */
const deleteCase = asyncHandler(async (req, res) => {
  const caseDoc = await Case.findById(req.params.id);
  if (!caseDoc) {
    res.status(404);
    throw new Error('Case not found.');
  }
  await caseDoc.deleteOne();
  res.json({ message: 'Case removed.' });
});

module.exports = { getCases, getCaseById, createCase, updateCase, deleteCase };

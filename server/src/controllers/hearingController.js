/**
 * Hearing controller — CRUD + listing by case/date/status.
 */
const asyncHandler = require('express-async-handler');
const Hearing = require('../models/Hearing');
const Case = require('../models/Case');

/**
 * @desc    Get hearings. Filters: ?caseId=, ?date=, ?status=
 * @route   GET /api/hearings
 * @access  Private
 */
const getHearings = asyncHandler(async (req, res) => {
  const { caseId, date, status } = req.query;
  const filter = {};
  if (caseId) filter.case = caseId;
  if (status) filter.status = status;
  // date filter matches the calendar day.
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }
  const hearings = await Hearing.find(filter)
    .populate({
      path: 'case',
      select: 'caseNumber title caseType status courtRoom',
    })
    .populate('judge', 'name email specialization')
    .sort({ date: 1, time: 1 });
  res.json(hearings);
});

/**
 * @desc    Get a single hearing by id.
 * @route   GET /api/hearings/:id
 * @access  Private
 */
const getHearingById = asyncHandler(async (req, res) => {
  const hearing = await Hearing.findById(req.params.id)
    .populate('case')
    .populate('judge', 'name email specialization court');
  if (!hearing) {
    res.status(404);
    throw new Error('Hearing not found.');
  }
  res.json(hearing);
});

/**
 * @desc    Create a hearing. Also updates the parent case's nextHearingDate
 *          if this hearing is in the future and Scheduled.
 * @route   POST /api/hearings
 * @access  Private (judge, registrar, admin)
 */
const createHearing = asyncHandler(async (req, res) => {
  const { case: caseId, date, time, courtRoom, judge, status, agenda, notes } = req.body;
  if (!caseId || !date || !time || !courtRoom) {
    res.status(400);
    throw new Error('caseId, date, time, courtRoom are required.');
  }
  const parentCase = await Case.findById(caseId);
  if (!parentCase) {
    res.status(404);
    throw new Error('Referenced case not found.');
  }
  const hearing = await Hearing.create({
    case: caseId,
    date,
    time,
    courtRoom,
    judge: judge || parentCase.judge,
    status,
    agenda,
    notes,
  });
  // If the hearing is scheduled and in the future, sync the case.
  if (hearing.status === 'Scheduled' && new Date(hearing.date) > new Date()) {
    parentCase.nextHearingDate = hearing.date;
    await parentCase.save();
  }
  res.status(201).json(hearing);
});

/**
 * @desc    Update a hearing.
 * @route   PUT /api/hearings/:id
 * @access  Private (judge, registrar, admin)
 */
const updateHearing = asyncHandler(async (req, res) => {
  const hearing = await Hearing.findById(req.params.id);
  if (!hearing) {
    res.status(404);
    throw new Error('Hearing not found.');
  }
  ['case', 'date', 'time', 'courtRoom', 'judge', 'status', 'agenda', 'notes'].forEach(
    (f) => {
      if (req.body[f] !== undefined) hearing[f] = req.body[f];
    }
  );
  const updated = await hearing.save();
  res.json(updated);
});

/**
 * @desc    Delete a hearing.
 * @route   DELETE /api/hearings/:id
 * @access  Private (admin only)
 */
const deleteHearing = asyncHandler(async (req, res) => {
  const hearing = await Hearing.findById(req.params.id);
  if (!hearing) {
    res.status(404);
    throw new Error('Hearing not found.');
  }
  await hearing.deleteOne();
  res.json({ message: 'Hearing removed.' });
});

module.exports = {
  getHearings,
  getHearingById,
  createHearing,
  updateHearing,
  deleteHearing,
};

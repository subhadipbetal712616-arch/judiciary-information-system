/**
 * Dashboard controller — aggregated stats for the home screen.
 */
const asyncHandler = require('express-async-handler');
const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const Judgment = require('../models/Judgment');
const User = require('../models/User');

/**
 * Helper: start of today (local) as a Date.
 */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * @desc    Aggregate counts for the dashboard.
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = asyncHandler(async (req, res) => {
  const today = startOfToday();
  // End of the current week (today + 7 days).
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  // First and last day of the current month.
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    totalCases,
    openCases,
    disposedCases,
    hearingsThisWeek,
    judgmentsThisMonth,
    usersByRoleAgg,
  ] = await Promise.all([
    Case.countDocuments(),
    Case.countDocuments({ status: { $in: ['Filed', 'Pending', 'In Progress', 'Adjourned'] } }),
    Case.countDocuments({ status: { $in: ['Disposed', 'Closed'] } }),
    Hearing.countDocuments({ date: { $gte: today, $lte: weekEnd }, status: 'Scheduled' }),
    Judgment.countDocuments({ judgmentDate: { $gte: monthStart, $lte: monthEnd } }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
  ]);

  // Convert aggregation to a { role: count } map.
  const usersByRole = usersByRoleAgg.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  res.json({
    totalCases,
    openCases,
    disposedCases,
    hearingsThisWeek,
    judgmentsThisMonth,
    usersByRole,
  });
});

/**
 * @desc    Next 5 scheduled hearings.
 * @route   GET /api/dashboard/upcoming-hearings
 * @access  Private
 */
const getUpcomingHearings = asyncHandler(async (req, res) => {
  const today = startOfToday();
  const hearings = await Hearing.find({ date: { $gte: today }, status: 'Scheduled' })
    .populate({ path: 'case', select: 'caseNumber title caseType' })
    .populate('judge', 'name')
    .sort({ date: 1, time: 1 })
    .limit(5);
  res.json(hearings);
});

/**
 * @desc    Last 5 filed cases.
 * @route   GET /api/dashboard/recent-cases
 * @access  Private
 */
const getRecentCases = asyncHandler(async (req, res) => {
  const cases = await Case.find()
    .populate('judge', 'name')
    .populate('lawyer', 'name')
    .sort({ filingDate: -1, createdAt: -1 })
    .limit(5);
  res.json(cases);
});

module.exports = { getStats, getUpcomingHearings, getRecentCases };

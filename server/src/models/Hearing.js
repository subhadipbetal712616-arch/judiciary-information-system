/**
 * Hearing model — a scheduled (or completed) court session for a case.
 */
const mongoose = require('mongoose');

const hearingSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true }, // e.g. "10:30"
    courtRoom: { type: String, required: true, trim: true },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Adjourned', 'Cancelled'],
      default: 'Scheduled',
    },
    agenda: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hearing', hearingSchema);

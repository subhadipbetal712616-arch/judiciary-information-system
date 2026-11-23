/**
 * Case model — the central record of the judiciary system.
 * A case references a judge, lawyer, and registrar (all User docs).
 */
const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    caseType: {
      type: String,
      enum: ['Civil', 'Criminal', 'Family', 'Constitutional', 'Property'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Filed', 'Pending', 'In Progress', 'Adjourned', 'Disposed', 'Closed'],
      default: 'Filed',
    },
    plaintiff: { type: String, required: true, trim: true },
    defendant: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registrar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    filingDate: { type: Date, default: Date.now },
    nextHearingDate: { type: Date },
    courtRoom: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Case', caseSchema);

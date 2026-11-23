/**
 * Judgment model — the final verdict delivered for a case.
 * Enforced unique on `case` so only one judgment exists per case.
 */
const mongoose = require('mongoose');

const judgmentSchema = new mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      unique: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    judgmentDate: { type: Date, required: true, default: Date.now },
    verdict: {
      type: String,
      enum: [
        'Guilty',
        'Not Guilty',
        'In Favor of Plaintiff',
        'In Favor of Defendant',
        'Dismissed',
        'Acquitted',
      ],
      required: true,
    },
    summary: { type: String, required: true, trim: true },
    fullText: { type: String, trim: true },
    sentenceOrRelief: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Judgment', judgmentSchema);

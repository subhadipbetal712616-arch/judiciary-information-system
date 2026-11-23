/**
 * User model.
 *
 * Stores account info for all roles: admin, judge, lawyer, registrar.
 * Passwords are hashed automatically via a pre-save hook.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['admin', 'judge', 'lawyer', 'registrar'],
      default: 'lawyer',
    },
    // Lawyers typically have a bar council registration number.
    barNumber: { type: String, sparse: true, trim: true },
    // Judges / registrars use an internal employee id.
    employeeId: { type: String, sparse: true, trim: true },
    phone: { type: String, trim: true },
    specialization: { type: String, trim: true },
    court: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving whenever it changes.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare a plaintext password against the stored hash.
 * @param {string} entered - plaintext password from login form
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);

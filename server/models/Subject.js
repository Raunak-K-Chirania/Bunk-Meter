const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  action: { type: String, enum: ['attended', 'missed'], required: true },
  totalAfter: { type: Number },
  attendedAfter: { type: Number },
  percentageAfter: { type: Number },
});

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true, trim: true },
  totalClasses: { type: Number, default: 0, min: 0 },
  attendedClasses: { type: Number, default: 0, min: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // AI-enhanced fields
  attendanceHistory: [attendanceLogSchema],
  riskScore: { type: Number, default: 0 }, // 0-100
  riskLevel: { type: String, enum: ['safe', 'warning', 'critical'], default: 'safe' },
  aiPredictedPercentage: { type: Number, default: null },
  lastAiUpdate: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  weeklyPattern: { type: [Number], default: [] }, // attendance per week
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

subjectSchema.virtual('attendancePercentage').get(function () {
  if (this.totalClasses === 0) return 0;
  return parseFloat(((this.attendedClasses / this.totalClasses) * 100).toFixed(2));
});

subjectSchema.virtual('safeBunks').get(function () {
  const safe = Math.floor(this.attendedClasses / 0.75 - this.totalClasses);
  return safe > 0 ? safe : 0;
});

subjectSchema.virtual('classesNeeded').get(function () {
  const needed = Math.ceil((0.75 * this.totalClasses - this.attendedClasses) / 0.25);
  return needed > 0 ? needed : 0;
});

module.exports = mongoose.model('Subject', subjectSchema);

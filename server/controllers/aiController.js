const Subject = require('../models/Subject');
const {
  predictSubject,
  generateRecommendations,
  generateInsights,
  generateWeeklySummary,
  planBunks,
} = require('../utils/aiEngine');
const { chatWithGemini } = require('../utils/geminiService');

// ─── PREDICT ATTENDANCE ───────────────────────────────────────────────────────
const predictAttendance = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });

    if (subjects.length === 0) {
      return res.json({ predictions: [], message: 'No subjects found. Add subjects to get predictions.' });
    }

    const predictions = subjects
      .filter((s) => s.totalClasses > 0)
      .map((s) => predictSubject(s));

    // Also update risk score in DB (async, non-blocking)
    predictions.forEach(async (pred) => {
      try {
        await Subject.findOneAndUpdate(
          { userId: req.user._id, subjectName: pred.subjectName },
          {
            riskScore: pred.riskScore,
            riskLevel: pred.riskLevel,
            aiPredictedPercentage: pred.predictions.next10,
            lastAiUpdate: new Date(),
          },
          { new: false }
        );
      } catch (_) { /* silent */ }
    });

    res.json({ predictions, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[AI Predict]', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── RECOMMENDATIONS ───────────────────────────────────────────────────────────
const getRecommendations = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    const recommendations = generateRecommendations(subjects);
    res.json({ recommendations, total: recommendations.length, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[AI Recommend]', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────
const getInsights = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    const insights = generateInsights(subjects);
    res.json({ insights, total: insights.length, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[AI Insights]', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── WEEKLY REPORT ─────────────────────────────────────────────────────────────
const getWeeklyReport = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    const summary = generateWeeklySummary(subjects, req.user.name);
    const predictions = subjects.filter((s) => s.totalClasses > 0).map((s) => predictSubject(s));
    const recommendations = generateRecommendations(subjects);
    const insights = generateInsights(subjects);

    res.json({
      summary,
      predictions,
      recommendations: recommendations.slice(0, 5),
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI Report]', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
const chatWithBot = async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.trim().length > 500) {
      return res.status(400).json({ message: 'Message too long (max 500 chars)' });
    }

    const subjects = await Subject.find({ userId: req.user._id });
    const response = await chatWithGemini(
      message.trim(),
      subjects,
      req.user.name,
      chatHistory
    );

    res.json({
      reply: response.text,
      source: response.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI Chat]', error);
    res.status(500).json({ message: 'Chat service unavailable. Please try again.' });
  }
};

// ─── RISK ANALYSIS ────────────────────────────────────────────────────────────
const getRiskAnalysis = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });

    const risks = subjects
      .filter((s) => s.totalClasses > 0)
      .map((s) => {
        const pred = predictSubject(s);
        return {
          subject: s.subjectName,
          currentPercentage: pred.currentPercentage,
          riskScore: pred.riskScore,
          riskLevel: pred.riskLevel,
          trend: pred.trend,
          trendLabel: pred.trendLabel,
          safeBunks: pred.safeBunks,
          classesNeeded: pred.classesNeeded,
          message: pred.message,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);

    const critical = risks.filter((r) => r.riskLevel === 'critical');
    const warning = risks.filter((r) => r.riskLevel === 'warning');
    const safe = risks.filter((r) => r.riskLevel === 'safe');

    res.json({
      risks,
      summary: {
        critical: critical.length,
        warning: warning.length,
        safe: safe.length,
        mostDangerous: critical[0] || warning[0] || null,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI Risk]', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── BUNK PLANNER ─────────────────────────────────────────────────────────────
const getBunkPlan = async (req, res) => {
  try {
    const { desiredBunks = 1 } = req.query;
    const subjects = await Subject.find({ userId: req.user._id });
    const plan = planBunks(subjects, parseInt(desiredBunks));
    res.json({ ...plan, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[AI Bunk Plan]', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── SIMULATE ─────────────────────────────────────────────────────────────────
const simulateAttendance = async (req, res) => {
  try {
    const { subjectId, attendCount = 0, missCount = 0 } = req.body;

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const newTotal = subject.totalClasses + attendCount + missCount;
    const newAttended = subject.attendedClasses + attendCount;
    const newPct = newTotal === 0 ? 0 : (newAttended / newTotal) * 100;
    const pred = predictSubject({ ...subject.toObject(), totalClasses: newTotal, attendedClasses: newAttended });

    res.json({
      subjectName: subject.subjectName,
      original: {
        attended: subject.attendedClasses,
        total: subject.totalClasses,
        percentage: subject.totalClasses === 0 ? 0 : ((subject.attendedClasses / subject.totalClasses) * 100).toFixed(2),
      },
      simulated: {
        attended: newAttended,
        total: newTotal,
        percentage: parseFloat(newPct.toFixed(2)),
        riskLevel: pred.riskLevel,
        safeBunks: pred.safeBunks,
        classesNeeded: pred.classesNeeded,
      },
      delta: parseFloat((newPct - (subject.totalClasses === 0 ? 0 : (subject.attendedClasses / subject.totalClasses) * 100)).toFixed(2)),
    });
  } catch (error) {
    console.error('[AI Simulate]', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── LOG ATTENDANCE ───────────────────────────────────────────────────────────
const logAttendance = async (req, res) => {
  try {
    const { subjectId, action } = req.body; // action: 'attended' | 'missed'
    if (!['attended', 'missed'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const newTotal = subject.totalClasses + 1;
    const newAttended = action === 'attended' ? subject.attendedClasses + 1 : subject.attendedClasses;
    const newPct = (newAttended / newTotal) * 100;

    subject.totalClasses = newTotal;
    subject.attendedClasses = newAttended;
    subject.attendanceHistory.push({
      action,
      date: new Date(),
      totalAfter: newTotal,
      attendedAfter: newAttended,
      percentageAfter: parseFloat(newPct.toFixed(2)),
    });

    // Update risk
    const pred = predictSubject(subject.toObject());
    subject.riskScore = pred.riskScore;
    subject.riskLevel = pred.riskLevel;
    subject.aiPredictedPercentage = pred.predictions.next10;
    subject.lastAiUpdate = new Date();

    await subject.save();

    res.json({
      subject,
      prediction: pred,
      message: action === 'attended' ? 'Attendance marked ✅' : 'Absence recorded 📌',
    });
  } catch (error) {
    console.error('[Log Attendance]', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  predictAttendance,
  getRecommendations,
  getInsights,
  getWeeklyReport,
  chatWithBot,
  getRiskAnalysis,
  getBunkPlan,
  simulateAttendance,
  logAttendance,
};

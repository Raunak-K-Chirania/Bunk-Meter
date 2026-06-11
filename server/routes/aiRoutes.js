const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const {
  predictAttendance,
  getRecommendations,
  getInsights,
  getWeeklyReport,
  chatWithBot,
  getRiskAnalysis,
  getBunkPlan,
  simulateAttendance,
  logAttendance,
} = require('../controllers/aiController');

// Rate limiter for chat (stricter) — 30 requests per 15 min
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many chat requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General AI rate limiter — 100 requests per 15 min
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please try again later.' },
});

// All AI routes require authentication
router.use(protect);
router.use(aiLimiter);

// ─── AI Endpoints ─────────────────────────────────────────────────────────────
router.get('/predict',        predictAttendance);    // GET  /api/ai/predict
router.get('/recommend',      getRecommendations);   // GET  /api/ai/recommend
router.get('/insights',       getInsights);          // GET  /api/ai/insights
router.get('/report',         getWeeklyReport);      // GET  /api/ai/report
router.get('/risk',           getRiskAnalysis);      // GET  /api/ai/risk
router.get('/bunk-plan',      getBunkPlan);          // GET  /api/ai/bunk-plan?desiredBunks=2

router.post('/chat', chatLimiter, chatWithBot);      // POST /api/ai/chat
router.post('/simulate',      simulateAttendance);   // POST /api/ai/simulate
router.post('/log-attendance', logAttendance);       // POST /api/ai/log-attendance

module.exports = router;

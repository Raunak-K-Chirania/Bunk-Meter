/**
 * BunkMeter AI Engine
 * Pure JavaScript ML implementation:
 * - Linear Regression for attendance prediction
 * - Risk Classification
 * - Smart Recommendations
 * - Insight Generation
 */

// ─── MATH UTILITIES ────────────────────────────────────────────────────────────

/**
 * Simple Linear Regression: y = mx + b
 * Fits a line through attendance data points
 */
const linearRegression = (points) => {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0, r2: 0 };

  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² coefficient
  const meanY = sumY / n;
  const ssTot = points.reduce((a, p) => a + (p.y - meanY) ** 2, 0);
  const ssRes = points.reduce((a, p) => a + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
};

/**
 * Predict attendance after N more classes
 */
const predictAfterNClasses = (attended, total, missCount, attendCount) => {
  const newTotal = total + missCount + attendCount;
  const newAttended = attended + attendCount;
  if (newTotal === 0) return 0;
  return parseFloat(((newAttended / newTotal) * 100).toFixed(2));
};

/**
 * Classes needed to reach target percentage
 */
const classesToReachTarget = (attended, total, target = 75) => {
  // (attended + x) / (total + x) >= target/100
  // x >= (target * total - 100 * attended) / (100 - target)
  const needed = Math.ceil((target * total - 100 * attended) / (100 - target));
  return needed > 0 ? needed : 0;
};

/**
 * Safe bunks calculation
 */
const safeBunksCount = (attended, total, target = 75) => {
  const safe = Math.floor(attended / (target / 100) - total);
  return safe > 0 ? safe : 0;
};

// ─── RISK CLASSIFICATION ────────────────────────────────────────────────────────

/**
 * Classify risk level with a 0-100 score
 */
const classifyRisk = (percentage, trend = 0) => {
  // Base risk from percentage
  let score;
  if (percentage >= 85) score = 5;
  else if (percentage >= 80) score = 15;
  else if (percentage >= 75) score = 30;
  else if (percentage >= 70) score = 55;
  else if (percentage >= 65) score = 70;
  else if (percentage >= 60) score = 82;
  else score = 92;

  // Adjust for trend (negative trend = higher risk)
  if (trend < -2) score = Math.min(100, score + 15);
  else if (trend < -0.5) score = Math.min(100, score + 8);
  else if (trend > 1) score = Math.max(0, score - 5);

  const level = score <= 25 ? 'safe' : score <= 65 ? 'warning' : 'critical';
  return { score: Math.round(score), level };
};

// ─── ATTENDANCE PREDICTION ─────────────────────────────────────────────────────

/**
 * Generate comprehensive AI predictions for a single subject
 */
const predictSubject = (subject) => {
  const { subjectName, attendedClasses, totalClasses, attendanceHistory = [] } = subject;
  const pct = totalClasses === 0 ? 0 : (attendedClasses / totalClasses) * 100;

  // Build time-series from history
  let histPoints = [];
  if (attendanceHistory.length >= 2) {
    let cumTotal = 0, cumAttended = 0;
    const sorted = [...attendanceHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach((log, i) => {
      cumTotal += 1;
      if (log.action === 'attended') cumAttended += 1;
      histPoints.push({ x: i + 1, y: (cumAttended / cumTotal) * 100 });
    });
  } else {
    // Fallback: use current state
    histPoints = [{ x: 1, y: pct }];
  }

  const regression = histPoints.length >= 2 ? linearRegression(histPoints) : { slope: 0, intercept: pct, r2: 0 };
  const trend = regression.slope; // %/class change

  // Predict future percentages
  const n = histPoints.length;
  const predict = (classesAhead) => {
    if (histPoints.length < 2) {
      // Use formula-based prediction
      return predictAfterNClasses(attendedClasses, totalClasses, classesAhead, 0);
    }
    const raw = regression.slope * (n + classesAhead) + regression.intercept;
    return Math.max(0, Math.min(100, parseFloat(raw.toFixed(2))));
  };

  const riskInfo = classifyRisk(pct, trend);

  // Compute milestone predictions
  const after2Miss = predictAfterNClasses(attendedClasses, totalClasses, 2, 0);
  const after5Classes = predictAfterNClasses(attendedClasses, totalClasses, 0, 5); // attend 5
  const safe = safeBunksCount(attendedClasses, totalClasses);
  const needed = classesToReachTarget(attendedClasses, totalClasses, 75);

  // Generate natural-language prediction message
  let message = '';
  if (pct >= 75) {
    if (safe > 0) {
      message = `You can safely miss up to ${safe} more ${subjectName} class${safe !== 1 ? 'es' : ''} and stay above 75%.`;
      if (trend < -1) message += ` However, attendance is trending down — stay alert.`;
    } else {
      message = `Attendance is at ${pct.toFixed(1)}% — you're barely in the safe zone. Avoid missing any classes.`;
    }
  } else if (totalClasses === 0) {
    message = `No classes recorded yet for ${subjectName}. Start marking attendance to get predictions.`;
  } else {
    message = `Attendance is at ${pct.toFixed(1)}% — below the 75% threshold. Attend ${needed} consecutive class${needed !== 1 ? 'es' : ''} to recover.`;
    if (after2Miss < 70) message += ` Missing 2 more will drop you to ${after2Miss.toFixed(1)}%.`;
  }

  return {
    subjectName,
    currentPercentage: parseFloat(pct.toFixed(2)),
    trend: parseFloat(trend.toFixed(3)),
    trendLabel: trend > 0.5 ? 'improving' : trend < -0.5 ? 'declining' : 'stable',
    riskScore: riskInfo.score,
    riskLevel: riskInfo.level,
    safeBunks: safe,
    classesNeeded: needed,
    predictions: {
      after5Classes: parseFloat(after5Classes.toFixed(2)),
      after2Miss: parseFloat(after2Miss.toFixed(2)),
      next10: parseFloat(predict(10).toFixed(2)),
      next20: parseFloat(predict(20).toFixed(2)),
    },
    message,
    r2: parseFloat((regression.r2 ?? 0).toFixed(3)),
  };
};

// ─── RECOMMENDATIONS ───────────────────────────────────────────────────────────

/**
 * Generate smart, prioritized recommendations for all subjects
 */
const generateRecommendations = (subjects) => {
  const recs = [];

  subjects.forEach((s) => {
    const pct = s.totalClasses === 0 ? 0 : (s.attendedClasses / s.totalClasses) * 100;
    const safe = safeBunksCount(s.attendedClasses, s.totalClasses);
    const needed = classesToReachTarget(s.attendedClasses, s.totalClasses, 75);

    if (s.totalClasses === 0) return;

    if (pct < 60) {
      recs.push({
        type: 'critical',
        subject: s.subjectName,
        priority: 1,
        icon: '🚨',
        title: `Critical: ${s.subjectName}`,
        message: `Attendance at ${pct.toFixed(1)}% is critically low! You need ${needed} more classes urgently to avoid academic penalties.`,
        action: `Attend next ${Math.min(needed, 10)} classes without fail`,
      });
    } else if (pct < 70) {
      recs.push({
        type: 'warning',
        subject: s.subjectName,
        priority: 2,
        icon: '⚠️',
        title: `Warning: ${s.subjectName}`,
        message: `${s.subjectName} attendance is ${pct.toFixed(1)}%. Attend ${needed} more classes to reach the 75% threshold.`,
        action: `Prioritize ${s.subjectName} this week`,
      });
    } else if (pct < 78) {
      recs.push({
        type: 'caution',
        subject: s.subjectName,
        priority: 3,
        icon: '📌',
        title: `Stay Consistent: ${s.subjectName}`,
        message: `${s.subjectName} is at ${pct.toFixed(1)}%. You have very little buffer — avoid missing any classes.`,
        action: `Do not miss any ${s.subjectName} classes for now`,
      });
    } else if (pct >= 90 && safe >= 3) {
      recs.push({
        type: 'bunk',
        subject: s.subjectName,
        priority: 5,
        icon: '✅',
        title: `Safe to Bunk: ${s.subjectName}`,
        message: `${s.subjectName} at ${pct.toFixed(1)}% — you can safely miss up to ${safe} class${safe !== 1 ? 'es' : ''}.`,
        action: `You have ${safe} bunk${safe !== 1 ? 's' : ''} available`,
      });
    } else if (safe > 0) {
      recs.push({
        type: 'info',
        subject: s.subjectName,
        priority: 4,
        icon: '💡',
        title: `Comfortable: ${s.subjectName}`,
        message: `${s.subjectName} at ${pct.toFixed(1)}%. You can miss ${safe} class${safe !== 1 ? 'es' : ''} while staying safe.`,
        action: `You have ${safe} safe bunk${safe !== 1 ? 's' : ''} available`,
      });
    }
  });

  return recs.sort((a, b) => a.priority - b.priority);
};

// ─── INSIGHTS GENERATION ───────────────────────────────────────────────────────

/**
 * Generate AI insight cards from subject data
 */
const generateInsights = (subjects) => {
  const insights = [];
  if (!subjects.length) return insights;

  const withData = subjects.filter((s) => s.totalClasses > 0);
  if (!withData.length) return insights;

  const percentages = withData.map((s) => (s.attendedClasses / s.totalClasses) * 100);
  const avgPct = percentages.reduce((a, b) => a + b, 0) / percentages.length;
  const totalClasses = withData.reduce((a, s) => a + s.totalClasses, 0);
  const totalAttended = withData.reduce((a, s) => a + s.attendedClasses, 0);
  const overallPct = totalClasses === 0 ? 0 : (totalAttended / totalClasses) * 100;
  const totalSafeBunks = withData.reduce((a, s) => a + safeBunksCount(s.attendedClasses, s.totalClasses), 0);

  // Best performing subject
  const best = withData.reduce((a, b) =>
    (a.attendedClasses / a.totalClasses) > (b.attendedClasses / b.totalClasses) ? a : b
  );
  const worst = withData.reduce((a, b) =>
    (a.attendedClasses / a.totalClasses) < (b.attendedClasses / b.totalClasses) ? a : b
  );

  const criticalSubjects = withData.filter((s) => (s.attendedClasses / s.totalClasses) * 100 < 75);
  const safeSubjects = withData.filter((s) => (s.attendedClasses / s.totalClasses) * 100 >= 80);

  insights.push({
    id: 'overall',
    type: overallPct >= 75 ? 'positive' : 'negative',
    icon: overallPct >= 75 ? '📊' : '⚠️',
    title: 'Overall Performance',
    message: overallPct >= 75
      ? `Your overall attendance is ${overallPct.toFixed(1)}% — well above the 75% threshold. Keep it up!`
      : `Overall attendance is ${overallPct.toFixed(1)}% — below 75%. Focus on improving across all subjects.`,
    value: `${overallPct.toFixed(1)}%`,
    color: overallPct >= 75 ? 'emerald' : 'red',
  });

  if (totalSafeBunks > 0) {
    insights.push({
      id: 'safebunks',
      type: 'positive',
      icon: '🎉',
      title: 'Safe Bunk Opportunities',
      message: `You have a total of ${totalSafeBunks} safe bunk${totalSafeBunks !== 1 ? 's' : ''} available across all subjects. Use them wisely!`,
      value: `${totalSafeBunks} bunks`,
      color: 'indigo',
    });
  }

  insights.push({
    id: 'best',
    type: 'positive',
    icon: '🏆',
    title: 'Top Subject',
    message: `${best.subjectName} has your best attendance at ${((best.attendedClasses / best.totalClasses) * 100).toFixed(1)}%. Excellent consistency!`,
    value: `${((best.attendedClasses / best.totalClasses) * 100).toFixed(1)}%`,
    color: 'emerald',
  });

  if (worst.totalClasses > 0) {
    const worstPct = (worst.attendedClasses / worst.totalClasses) * 100;
    insights.push({
      id: 'worst',
      type: worstPct >= 75 ? 'neutral' : 'negative',
      icon: worstPct >= 75 ? '📌' : '🚨',
      title: 'Needs Attention',
      message: `${worst.subjectName} has your lowest attendance at ${worstPct.toFixed(1)}%. ${worstPct < 75 ? 'Immediate action required!' : 'Keep an eye on it.'}`,
      value: `${worstPct.toFixed(1)}%`,
      color: worstPct >= 75 ? 'amber' : 'red',
    });
  }

  if (criticalSubjects.length > 0) {
    insights.push({
      id: 'critical',
      type: 'negative',
      icon: '🔴',
      title: `${criticalSubjects.length} Subject${criticalSubjects.length > 1 ? 's' : ''} at Risk`,
      message: `${criticalSubjects.map((s) => s.subjectName).join(', ')} ${criticalSubjects.length > 1 ? 'are' : 'is'} below 75%. Act now to avoid consequences.`,
      value: criticalSubjects.length,
      color: 'red',
    });
  }

  if (safeSubjects.length === withData.length) {
    insights.push({
      id: 'allsafe',
      type: 'positive',
      icon: '🌟',
      title: 'All Subjects Safe!',
      message: `Amazing! All ${withData.length} subjects are above 80% attendance. You're in great shape this semester.`,
      value: '100% safe',
      color: 'emerald',
    });
  }

  // Variance analysis
  if (percentages.length >= 2) {
    const variance = percentages.reduce((a, p) => a + (p - avgPct) ** 2, 0) / percentages.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > 15) {
      insights.push({
        id: 'inconsistent',
        type: 'warning',
        icon: '📉',
        title: 'Inconsistent Pattern Detected',
        message: `Your attendance varies significantly across subjects (σ=${stdDev.toFixed(1)}%). Consider balancing your effort across all subjects.`,
        value: `±${stdDev.toFixed(1)}%`,
        color: 'amber',
      });
    }
  }

  return insights;
};

// ─── WEEKLY REPORT ─────────────────────────────────────────────────────────────

/**
 * Generate a text-based weekly AI summary
 */
const generateWeeklySummary = (subjects, userName = 'Student') => {
  const withData = subjects.filter((s) => s.totalClasses > 0);
  if (!withData.length) {
    return `Hi ${userName}! No attendance data available yet. Start marking your attendance to receive AI-powered insights.`;
  }

  const totalClasses = withData.reduce((a, s) => a + s.totalClasses, 0);
  const totalAttended = withData.reduce((a, s) => a + s.attendedClasses, 0);
  const overallPct = ((totalAttended / totalClasses) * 100).toFixed(1);
  const critical = withData.filter((s) => (s.attendedClasses / s.totalClasses) * 100 < 75);
  const safe = withData.filter((s) => (s.attendedClasses / s.totalClasses) * 100 >= 80);
  const totalBunks = withData.reduce((a, s) => a + safeBunksCount(s.attendedClasses, s.totalClasses), 0);

  let summary = `📋 **Attendance Summary for ${userName}**\n\n`;
  summary += `Overall attendance: **${overallPct}%** across ${withData.length} subject${withData.length > 1 ? 's' : ''}.\n\n`;

  if (overallPct >= 85) {
    summary += `🌟 Excellent performance! You're well above the required threshold. `;
  } else if (overallPct >= 75) {
    summary += `✅ You're safely above 75%, but don't get complacent. `;
  } else {
    summary += `⚠️ Overall attendance is below 75%. Immediate action is needed. `;
  }

  if (critical.length > 0) {
    summary += `\n\n🚨 **Critical subjects:** ${critical.map((s) => s.subjectName).join(', ')} — these need urgent attention.`;
  }

  if (safe.length > 0) {
    summary += `\n\n✅ **Safe subjects:** ${safe.map((s) => s.subjectName).join(', ')} — you have buffer here.`;
  }

  if (totalBunks > 0) {
    summary += `\n\n🎯 You have **${totalBunks} total safe bunk${totalBunks > 1 ? 's' : ''}** available across all subjects.`;
  }

  summary += `\n\n💡 **AI Tip:** ${
    critical.length > 0
      ? `Focus on ${critical[0].subjectName} first — it has the highest risk.`
      : overallPct >= 85
      ? 'Keep maintaining your excellent attendance pattern!'
      : 'Stay consistent and avoid missing classes on consecutive days.'
  }`;

  return summary;
};

// ─── BUNK PLANNER ──────────────────────────────────────────────────────────────

/**
 * Optimal bunk planner — tells you which subjects you can bunk
 * and how many times, given a total desired bunk count
 */
const planBunks = (subjects, desiredBunks = 1) => {
  const withData = subjects.filter((s) => s.totalClasses > 0);
  const safe = withData.map((s) => ({
    subject: s.subjectName,
    currentPct: parseFloat(((s.attendedClasses / s.totalClasses) * 100).toFixed(2)),
    safeBunks: safeBunksCount(s.attendedClasses, s.totalClasses),
  })).filter((s) => s.safeBunks > 0).sort((a, b) => b.safeBunks - a.safeBunks);

  const plan = [];
  let remaining = desiredBunks;

  for (const s of safe) {
    if (remaining <= 0) break;
    const use = Math.min(remaining, s.safeBunks);
    plan.push({ subject: s.subject, bunkCount: use, currentPct: s.currentPct });
    remaining -= use;
  }

  return {
    canAchieve: remaining === 0,
    plan,
    shortfall: remaining > 0 ? remaining : 0,
    message: remaining === 0
      ? `You can safely take ${desiredBunks} bunk${desiredBunks > 1 ? 's' : ''} across your subjects.`
      : `You can only safely bunk ${desiredBunks - remaining} out of ${desiredBunks} requested.`,
  };
};

module.exports = {
  predictSubject,
  generateRecommendations,
  generateInsights,
  generateWeeklySummary,
  planBunks,
  classifyRisk,
  linearRegression,
  predictAfterNClasses,
  classesToReachTarget,
  safeBunksCount,
};

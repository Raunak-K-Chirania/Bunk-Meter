const { GoogleGenerativeAI } = require('@google/generative-ai');
const { safeBunksCount, classesToReachTarget, predictAfterNClasses } = require('./aiEngine');

// Initialize Gemini
let genAI = null;
let model = null;

const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    return true;
  } catch (e) {
    console.error('[Gemini] Init error:', e.message);
    return false;
  }
};

/**
 * Build a rich context prompt for Gemini from the user's subject data
 */
const buildAttendanceContext = (subjects, userName = 'Student') => {
  if (!subjects || subjects.length === 0) {
    return `${userName} has no subjects registered yet.`;
  }

  const lines = subjects.map((s) => {
    const pct = s.totalClasses === 0 ? 0 : ((s.attendedClasses / s.totalClasses) * 100);
    const safe = safeBunksCount(s.attendedClasses, s.totalClasses);
    const needed = classesToReachTarget(s.attendedClasses, s.totalClasses, 75);
    const status = pct >= 75 ? 'SAFE' : 'AT RISK';
    return `  - ${s.subjectName}: ${pct.toFixed(1)}% attendance (${s.attendedClasses}/${s.totalClasses} classes) | ${status} | Safe bunks: ${safe} | Classes to recover: ${needed}`;
  }).join('\n');

  const totalClasses = subjects.reduce((a, s) => a + s.totalClasses, 0);
  const totalAttended = subjects.reduce((a, s) => a + s.attendedClasses, 0);
  const overall = totalClasses === 0 ? 0 : (totalAttended / totalClasses) * 100;
  const totalSafeBunks = subjects.reduce((a, s) => a + safeBunksCount(s.attendedClasses, s.totalClasses), 0);
  const atRisk = subjects.filter((s) => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < 75);

  return `Student: ${userName}
Overall attendance: ${overall.toFixed(1)}% (${totalAttended}/${totalClasses} total classes)
Total safe bunks available: ${totalSafeBunks}
Subjects at risk (below 75%): ${atRisk.length > 0 ? atRisk.map((s) => s.subjectName).join(', ') : 'None'}

Subject-wise breakdown:
${lines}`;
};

const SYSTEM_PROMPT = `You are BunkBot, an intelligent AI attendance assistant for college students using the "Student Bunk Meter" app.

Your personality:
- Friendly, concise, and student-focused
- Use emojis appropriately (not excessively)
- Be direct and helpful
- Give specific numbers, not vague advice
- Keep responses under 150 words unless the user explicitly asks for more detail

Your capabilities:
- Analyze attendance data and give personalized advice
- Calculate safe bunks and recovery plans
- Answer questions about attendance risk
- Provide motivational support
- Generate attendance strategies

Rules:
- Always refer to the actual data provided — never make up numbers
- If a subject name is mentioned, look it up in the data
- The minimum safe attendance threshold is 75%
- Be empathetic but realistic
- If no data is available, ask the user to add subjects first

You CANNOT:
- Access the internet
- Make changes to the attendance data
- Send emails or notifications`;

/**
 * Chat with Gemini using attendance context
 */
const chatWithGemini = async (userMessage, subjects, userName, chatHistory = []) => {
  const geminiAvailable = initGemini();

  if (!geminiAvailable) {
    // Fallback: rule-based responses
    return generateRuleBasedResponse(userMessage, subjects, userName);
  }

  try {
    const attendanceContext = buildAttendanceContext(subjects, userName);

    // Build conversation history for Gemini
    const history = chatHistory.slice(-6).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      systemInstruction: SYSTEM_PROMPT,
    });

    const fullPrompt = `[ATTENDANCE DATA]\n${attendanceContext}\n\n[USER MESSAGE]\n${userMessage}`;
    const result = await chat.sendMessage(fullPrompt);
    const response = result.response;
    return {
      text: response.text(),
      source: 'gemini',
    };
  } catch (error) {
    console.error('[Gemini] Chat error:', error.message);
    // Fallback to rule-based
    return generateRuleBasedResponse(userMessage, subjects, userName);
  }
};

/**
 * Rule-based fallback chatbot (works without Gemini API key)
 */
const generateRuleBasedResponse = (message, subjects, userName) => {
  const msg = message.toLowerCase();
  const withData = subjects.filter((s) => s.totalClasses > 0);

  // Greetings
  if (/^(hi|hello|hey|sup|yo)\b/.test(msg)) {
    return {
      text: `Hey ${userName}! 👋 I'm BunkBot, your AI attendance assistant. Ask me anything about your attendance — like "Can I bunk tomorrow?" or "Which subject is risky?"`,
      source: 'rule-based',
    };
  }

  // Can I bunk / safe bunk
  if (/bunk|skip|miss|absent/.test(msg)) {
    const subjectMatch = withData.find((s) => msg.includes(s.subjectName.toLowerCase()));

    if (subjectMatch) {
      const pct = (subjectMatch.attendedClasses / subjectMatch.totalClasses) * 100;
      const safe = safeBunksCount(subjectMatch.attendedClasses, subjectMatch.totalClasses);
      if (safe > 0) {
        return { text: `✅ Yes! You can safely bunk ${safe} more ${subjectMatch.subjectName} class${safe > 1 ? 'es' : ''} — currently at ${pct.toFixed(1)}%.`, source: 'rule-based' };
      } else {
        const needed = classesToReachTarget(subjectMatch.attendedClasses, subjectMatch.totalClasses, 75);
        return { text: `❌ No! ${subjectMatch.subjectName} is at ${pct.toFixed(1)}% — below 75%. You need ${needed} more class${needed > 1 ? 'es' : ''} to reach safety. Don't bunk!`, source: 'rule-based' };
      }
    }

    // General bunk query
    const totalSafe = withData.reduce((a, s) => a + safeBunksCount(s.attendedClasses, s.totalClasses), 0);
    const safeSubjects = withData.filter((s) => safeBunksCount(s.attendedClasses, s.totalClasses) > 0);
    if (safeSubjects.length > 0) {
      return { text: `You have ${totalSafe} safe bunk${totalSafe > 1 ? 's' : ''} available in: ${safeSubjects.map((s) => `${s.subjectName} (${safeBunksCount(s.attendedClasses, s.totalClasses)})`).join(', ')}. 🎉`, source: 'rule-based' };
    }
    return { text: `⚠️ You have no safe bunks available right now. Keep attending classes to build up a buffer!`, source: 'rule-based' };
  }

  // Which subject is risky / at risk
  if (/risk|danger|low|worst|bad|critical/.test(msg)) {
    const atRisk = withData.filter((s) => (s.attendedClasses / s.totalClasses) * 100 < 75);
    if (atRisk.length === 0) {
      return { text: `🌟 Great news! All your subjects are above 75%. No risks detected!`, source: 'rule-based' };
    }
    const sorted = atRisk.sort((a, b) => (a.attendedClasses / a.totalClasses) - (b.attendedClasses / b.totalClasses));
    const worst = sorted[0];
    const worstPct = (worst.attendedClasses / worst.totalClasses) * 100;
    return { text: `🔴 Most risky: **${worst.subjectName}** at ${worstPct.toFixed(1)}%. You need ${classesToReachTarget(worst.attendedClasses, worst.totalClasses, 75)} more classes to reach safety. Total at-risk: ${atRisk.length}.`, source: 'rule-based' };
  }

  // Attendance summary / how am I doing
  if (/summary|how am i|status|overview|overall/.test(msg)) {
    if (!withData.length) {
      return { text: `📭 No subjects added yet. Add your subjects in the dashboard to get your attendance summary!`, source: 'rule-based' };
    }
    const total = withData.reduce((a, s) => a + s.totalClasses, 0);
    const attended = withData.reduce((a, s) => a + s.attendedClasses, 0);
    const pct = ((attended / total) * 100).toFixed(1);
    const safe = withData.reduce((a, s) => a + safeBunksCount(s.attendedClasses, s.totalClasses), 0);
    const atRisk = withData.filter((s) => (s.attendedClasses / s.totalClasses) * 100 < 75).length;
    return {
      text: `📊 **Your Summary**\n• Overall: ${pct}%\n• Total safe bunks: ${safe}\n• Subjects at risk: ${atRisk}/${withData.length}\n\n${pct >= 75 ? '✅ You\'re in the safe zone!' : '⚠️ Overall attendance is below 75% — be careful!'}`,
      source: 'rule-based',
    };
  }

  // How many classes needed to recover
  if (/need|recover|how many|classes required/.test(msg)) {
    const atRisk = withData.filter((s) => (s.attendedClasses / s.totalClasses) * 100 < 75);
    if (!atRisk.length) {
      return { text: `✅ You don't need to recover — all subjects are above 75%!`, source: 'rule-based' };
    }
    const lines = atRisk.map((s) => {
      const n = classesToReachTarget(s.attendedClasses, s.totalClasses, 75);
      return `• ${s.subjectName}: ${n} more class${n > 1 ? 'es' : ''} needed`;
    }).join('\n');
    return { text: `📚 Classes needed to reach 75%:\n${lines}`, source: 'rule-based' };
  }

  // Best subject
  if (/best|top|highest|favorite/.test(msg)) {
    if (!withData.length) return { text: `No subjects data available yet!`, source: 'rule-based' };
    const best = withData.reduce((a, b) => (a.attendedClasses / a.totalClasses) > (b.attendedClasses / b.totalClasses) ? a : b);
    const bestPct = (best.attendedClasses / best.totalClasses) * 100;
    return { text: `🏆 Your best subject is **${best.subjectName}** with ${bestPct.toFixed(1)}% attendance. Excellent work!`, source: 'rule-based' };
  }

  // Motivation
  if (/motivat|encourage|inspire|help|depressed|stressed/.test(msg)) {
    const motivations = [
      "💪 Every class you attend brings you one step closer to academic success. Keep going!",
      "🌟 Small consistent efforts compound into big results. Your future self will thank you!",
      "🎯 75% is the floor, not the ceiling. Aim higher and give yourself more freedom!",
      "🚀 You've got this! Track your attendance, stay consistent, and the results will follow.",
    ];
    return { text: motivations[Math.floor(Math.random() * motivations.length)], source: 'rule-based' };
  }

  // Default
  const quickHelp = withData.length > 0
    ? `💬 You can ask me things like:\n• "Can I bunk tomorrow?"\n• "Which subject is risky?"\n• "Give me my summary"\n• "How many classes do I need in [subject]?"`
    : `💬 Start by adding subjects in the dashboard, then I can answer questions about your attendance!`;

  return { text: `I'm not sure I understood that. ${quickHelp}`, source: 'rule-based' };
};

module.exports = { chatWithGemini, buildAttendanceContext };

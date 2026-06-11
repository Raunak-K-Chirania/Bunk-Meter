import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiActivity } from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AttendanceBarChart, AttendancePieChart, AttendanceLineChart, AttendanceRadarChart } from '../components/charts/AttendanceCharts';
import { toast } from '../components/common/Toast';
import { subjectsAPI, aiAPI } from '../utils/api';
import { calcPercentage } from '../utils/helpers';
import { SkeletonCard, SkeletonList } from '../components/common/LoadingSkeletons';

const CHART_TYPES = [
  { id: 'bar', label: 'Bar Chart', icon: FiBarChart2 },
  { id: 'pie', label: 'Pie Chart', icon: FiPieChart },
  { id: 'line', label: 'Line Chart', icon: FiTrendingUp },
  { id: 'radar', label: 'Radar Chart', icon: FiActivity },
];

const Analytics = () => {
  const [subjects, setSubjects] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('bar');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await subjectsAPI.getAll();
        setSubjects(data);
        
        // Fetch AI Data
        const [insightsRes, recRes] = await Promise.all([
          aiAPI.getInsights(),
          aiAPI.getRecommendations()
        ]);
        setAiInsights(insightsRes.data.insights);
        setRecommendations(recRes.data.recommendations);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
        setAiLoading(false);
      }
    };
    fetch();
  }, []);

  const chartData = subjects.map(s => ({
    name: s.subjectName.length > 12 ? s.subjectName.substring(0, 12) + '…' : s.subjectName,
    subject: s.subjectName,
    percentage: calcPercentage(s.attendedClasses, s.totalClasses),
    value: calcPercentage(s.attendedClasses, s.totalClasses),
    risk: s.riskScore || 0,
    attended: s.attendedClasses,
    total: s.totalClasses,
    missed: s.totalClasses - s.attendedClasses,
  }));

  const totalClasses = subjects.reduce((a, c) => a + c.totalClasses, 0);
  const totalAttended = subjects.reduce((a, c) => a + c.attendedClasses, 0);
  const overallPct = calcPercentage(totalAttended, totalClasses);
  
  const bestSubject = subjects.reduce((best, s) => {
    const p = calcPercentage(s.attendedClasses, s.totalClasses);
    const bp = calcPercentage(best?.attendedClasses || 0, best?.totalClasses || 1);
    return p > bp ? s : best;
  }, null);

  const worstSubject = subjects.reduce((worst, s) => {
    if (s.totalClasses === 0) return worst;
    const p = s.riskScore || 0;
    const wp = worst ? (worst.riskScore || 0) : 0;
    return p > wp ? s : worst;
  }, null);

  // Simulation State
  const [simulation, setSimulation] = useState({ subjectId: '', attend: 0, miss: 0 });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const runSimulation = async () => {
    if (!simulation.subjectId) return;
    setSimLoading(true);
    try {
      const { data } = await aiAPI.simulate({
        subjectId: simulation.subjectId,
        attendCount: simulation.attend,
        missCount: simulation.miss
      });
      setSimResult(data);
    } catch {
      toast.error('Simulation failed');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Attendance Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Deep insights into your attendance patterns</p>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Overall', value: `${overallPct}%`, color: overallPct >= 75 ? '#10b981' : '#ef4444', sub: overallPct >= 75 ? 'Excellent' : 'Needs work' },
          { label: 'Total Classes', value: totalClasses, color: '#6366f1', sub: 'All subjects' },
          { label: 'Attended', value: totalAttended, color: '#06b6d4', sub: `${totalClasses - totalAttended} missed` },
          { label: 'Subjects', value: subjects.length, color: '#8b5cf6', sub: 'being tracked' },
        ].map(({ label, value, color, sub }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className="text-2xl md:text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-xs mt-1">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Best / Worst */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {bestSubject && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-5 border border-emerald-500/20">
              <p className="text-emerald-400 text-xs font-semibold mb-1 uppercase tracking-wider">🏆 Best Subject</p>
              <p className="text-white font-bold text-lg">{bestSubject.subjectName}</p>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{calcPercentage(bestSubject.attendedClasses, bestSubject.totalClasses)}%</p>
            </motion.div>
          )}
          {worstSubject && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-5 border border-red-500/20">
              <p className="text-red-400 text-xs font-semibold mb-1 uppercase tracking-wider">⚠ Needs Attention</p>
              <p className="text-white font-bold text-lg">{worstSubject.subjectName}</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{calcPercentage(worstSubject.attendedClasses, worstSubject.totalClasses)}%</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Chart Section */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-white">Attendance Visualization</h2>
          <div className="flex gap-2 flex-wrap">
            {CHART_TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveChart(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeChart === id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'glass text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No data yet. Add subjects to see analytics.
          </div>
        ) : (
          <motion.div key={activeChart} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeChart === 'bar' && <AttendanceBarChart data={chartData} />}
            {activeChart === 'pie' && <AttendancePieChart data={chartData} />}
            {activeChart === 'line' && <AttendanceLineChart data={chartData} />}
            {activeChart === 'radar' && <AttendanceRadarChart data={chartData} />}
          </motion.div>
        )}
      </div>

      {/* AI Behavioral Insights */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Smart Recommendations */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-indigo-500/20">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="bg-indigo-600 p-1.5 rounded-lg"><FiActivity size={16} /></span>
              AI Smart Recommendations
            </h2>
            {aiLoading ? (
              <SkeletonList count={3} />
            ) : recommendations.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No specific recommendations yet. Keep up the consistency!</p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      rec.priority === 'high' ? 'bg-red-500/5 border-red-500/20' : 
                      rec.priority === 'medium' ? 'bg-amber-500/5 border-amber-500/20' : 
                      'bg-emerald-500/5 border-emerald-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <span className="mt-0.5">{rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟠' : '🟢'}</span>
                        <div>
                          <h4 className={`font-semibold text-sm ${
                            rec.priority === 'high' ? 'text-red-300' : 
                            rec.priority === 'medium' ? 'text-amber-300' : 
                            'text-emerald-300'
                          }`}>{rec.subject}</h4>
                          <p className="text-slate-300 text-sm mt-1">{rec.message}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                        rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* AI Trends */}
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-indigo-900/30 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp size={20} className="text-indigo-400" />
              Behavioral Insights
            </h2>
            {aiLoading ? (
              <SkeletonList count={4} />
            ) : aiInsights ? (
              <div className="space-y-5">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <span className="text-sm">{insight.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-semibold">{insight.title}</h4>
                      <p className="text-slate-400 text-xs mt-0.5">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Log more attendance to generate behavioral patterns.</p>
            )}
          </div>
        </div>
      )}

      {/* AI Bunk Simulator */}
      {subjects.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-8 border border-purple-500/20 bg-gradient-to-br from-indigo-950/20 to-purple-950/20">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="bg-purple-600 p-1.5 rounded-lg">🔮</span>
            AI Bunk Simulator
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <p className="text-slate-400 text-sm">Preview how your attendance will change if you attend or skip upcoming classes.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Subject</label>
                  <select 
                    value={simulation.subjectId}
                    onChange={(e) => setSimulation({...simulation, subjectId: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Choose a subject...</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Classes to Attend</label>
                    <input 
                      type="number"
                      min="0"
                      value={simulation.attend}
                      onChange={(e) => setSimulation({...simulation, attend: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Classes to Miss</label>
                    <input 
                      type="number"
                      min="0"
                      value={simulation.miss}
                      onChange={(e) => setSimulation({...simulation, miss: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={runSimulation}
                  disabled={!simulation.subjectId || simLoading}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {simLoading ? 'Simulating...' : 'Run AI Prediction'}
                </button>
              </div>
            </div>

            <div className="relative min-h-[200px]">
              {simResult ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 h-full"
                >
                  <h4 className="text-slate-400 text-xs font-bold uppercase mb-4">Simulation Results for {simResult.subjectName}</h4>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase mb-1">Current</p>
                      <p className="text-xl font-bold text-white">{simResult.original.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase mb-1">Predicted</p>
                      <p className="text-xl font-bold text-purple-400">{simResult.simulated.percentage}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Change</span>
                      <span className={`font-bold ${simResult.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {simResult.delta >= 0 ? `+${simResult.delta}` : simResult.delta}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Predicted Risk</span>
                      <span className={`font-bold uppercase text-[10px] px-2 py-1 rounded bg-white/5 ${
                        simResult.simulated.riskLevel === 'critical' ? 'text-red-400' : 
                        simResult.simulated.riskLevel === 'warning' ? 'text-amber-400' : 
                        'text-emerald-400'
                      }`}>
                        {simResult.simulated.riskLevel}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-slate-300 text-xs italic">
                        {simResult.simulated.percentage >= 75 
                          ? `You will still be safe! You can even miss up to ${simResult.simulated.safeBunks} more classes.`
                          : `Warning! You will need to attend ${simResult.simulated.classesNeeded} more classes to get back to 75%.`
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/5 rounded-2xl p-8 text-center">
                  <span className="text-4xl mb-4 opacity-20">📊</span>
                  <p className="text-slate-500 text-sm">Adjust the numbers and click 'Run AI Prediction' to see the future of your attendance.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subject breakdown table */}
      {subjects.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">AI Risk Assessment Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="pb-3 text-slate-400 font-medium">Subject</th>
                  <th className="pb-3 text-slate-400 font-medium text-right">Attendance</th>
                  <th className="pb-3 text-slate-400 font-medium text-right">Risk Score</th>
                  <th className="pb-3 text-slate-400 font-medium text-right">Prediction (Next 10)</th>
                  <th className="pb-3 text-slate-400 font-medium text-right">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subjects.map((s, i) => {
                  const pct = calcPercentage(s.attendedClasses, s.totalClasses);
                  const riskColor = s.riskLevel === 'critical' ? '#ef4444' : s.riskLevel === 'warning' ? '#f59e0b' : '#10b981';
                  
                  return (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/2 transition-colors"
                    >
                      <td className="py-4 text-white font-medium">{s.subjectName}</td>
                      <td className="py-4 text-slate-300 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold" style={{ color: riskColor }}>{pct}%</span>
                          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: riskColor }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-300 text-right font-mono">{s.riskScore || 0}/100</td>
                      <td className="py-4 text-right">
                         <span className="text-indigo-400 font-bold">{s.aiPredictedPercentage ? `${s.aiPredictedPercentage}%` : 'TBD'}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          s.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' : 
                          s.riskLevel === 'warning' ? 'bg-amber-500/20 text-amber-400' : 
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {s.riskLevel || 'Safe'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analytics;

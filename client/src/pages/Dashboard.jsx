import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiBook, FiAlertTriangle, FiCheckCircle, 
  FiPlus, FiRefreshCw, FiTrendingDown, FiCalendar
} from 'react-icons/fi';
import { RiFireLine } from 'react-icons/ri';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import SubjectCard from '../components/dashboard/SubjectCard';
import SubjectFormModal from '../components/dashboard/SubjectFormModal';
import { ConfirmModal } from '../components/common/Modal';
import { SkeletonGrid, SkeletonList } from '../components/common/LoadingSkeletons';
import { AttendanceBarChart } from '../components/charts/AttendanceCharts';
import { toast } from '../components/common/Toast';
import { subjectsAPI } from '../utils/api';
import { calcPercentage, calcSafeBunks, getGreeting, getRandomQuote, formatDate } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [quote] = useState(getRandomQuote());

  const fetchSubjects = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await subjectsAPI.getAll();
      setSubjects(data);
    } catch {
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleAddOrEdit = async (form) => {
    setModalLoading(true);
    try {
      if (editSubject) {
        await subjectsAPI.update(editSubject._id, form);
        toast.success('Subject updated! ✏️');
      } else {
        await subjectsAPI.create(form);
        toast.success('Subject added! 📚');
      }
      setShowAddModal(false);
      setEditSubject(null);
      fetchSubjects(true);
    } catch {
      toast.error('Failed to save subject');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAttend = async (id) => {
    const s = subjects.find(s => s._id === id);
    try {
      await subjectsAPI.update(id, {
        totalClasses: s.totalClasses + 1,
        attendedClasses: s.attendedClasses + 1,
      });
      toast.success('Marked as attended ✅');
      fetchSubjects(true);
    } catch { toast.error('Failed to update'); }
  };

  const handleMiss = async (id) => {
    const s = subjects.find(s => s._id === id);
    try {
      await subjectsAPI.update(id, {
        totalClasses: s.totalClasses + 1,
        attendedClasses: s.attendedClasses,
      });
      toast.warning('Marked as missed 😔');
      fetchSubjects(true);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await subjectsAPI.delete(deleteId);
      toast.success('Subject deleted');
      setDeleteId(null);
      fetchSubjects(true);
    } catch { toast.error('Failed to delete'); }
    finally { setModalLoading(false); }
  };

  // Calculations
  const totalClasses = subjects.reduce((a, c) => a + c.totalClasses, 0);
  const totalAttended = subjects.reduce((a, c) => a + c.attendedClasses, 0);
  const overallPct = calcPercentage(totalAttended, totalClasses);
  const totalSafeBunks = subjects.reduce((a, s) => a + calcSafeBunks(s.attendedClasses, s.totalClasses), 0);
  const atRisk = subjects.filter(s => calcPercentage(s.attendedClasses, s.totalClasses) < 75 && s.totalClasses > 0);

  const chartData = subjects.map(s => ({
    name: s.subjectName.length > 10 ? s.subjectName.substring(0, 10) + '…' : s.subjectName,
    percentage: calcPercentage(s.attendedClasses, s.totalClasses),
  }));

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">{formatDate()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSubjects(true)}
              className={`p-2.5 rounded-xl glass hover:bg-white/10 text-slate-400 hover:text-white transition-all ${refreshing ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <FiRefreshCw size={18} />
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setEditSubject(null); setShowAddModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus size={18} />
              Add Subject
            </motion.button>
          </div>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 rounded-xl glass border border-indigo-500/20 flex items-start gap-3"
        >
          <RiFireLine size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-300 text-sm italic">"{quote.text}"</p>
            <p className="text-slate-500 text-xs mt-1">— {quote.author}</p>
          </div>
        </motion.div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <SkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            {
              title: 'Overall Attendance',
              value: overallPct,
              suffix: '%',
              icon: FiTrendingUp,
              color: overallPct >= 75 ? '#10b981' : '#ef4444',
              sub: overallPct >= 75 ? 'You\'re safe ✓' : 'Below 75% ⚠',
            },
            {
              title: 'Classes Attended',
              value: totalAttended,
              suffix: '',
              icon: FiCheckCircle,
              color: '#6366f1',
              sub: `of ${totalClasses} total`,
            },
            {
              title: 'Safe Bunks Left',
              value: totalSafeBunks,
              suffix: '',
              icon: FiBook,
              color: '#06b6d4',
              sub: 'across all subjects',
            },
            {
              title: 'Subjects at Risk',
              value: atRisk.length,
              suffix: '',
              icon: FiAlertTriangle,
              color: atRisk.length > 0 ? '#f59e0b' : '#10b981',
              sub: atRisk.length > 0 ? 'Need attention!' : 'All subjects safe',
            },
          ].map(({ title, value, suffix, icon: Icon, color, sub }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 relative overflow-hidden group"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: color }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${color}15`, color }}>{sub}</span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{title}</p>
              <p className="text-3xl font-bold text-white">
                {value}{suffix}
              </p>
              {title === 'Overall Attendance' && totalClasses > 0 && (
                <div className="mt-3 progress-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(overallPct, 100)}%` }}
                    transition={{ duration: 1.5, delay: 0.3 + i * 0.08 }}
                    className="progress-fill"
                    style={{ background: color }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Low Attendance Warning */}
      {!loading && atRisk.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
        >
          <FiAlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-300 font-semibold text-sm">Low Attendance Warning</h4>
            <p className="text-red-400/70 text-xs mt-1">
              {atRisk.map(s => s.subjectName).join(', ')} — below 75%. Attend classes ASAP!
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Grid: Subjects + Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Subjects */}
        <div className="xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Your Subjects</h2>
            <span className="text-slate-500 text-sm">{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : subjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <FiBook size={48} className="text-slate-600 mx-auto mb-4" />
              <h3 className="text-slate-300 font-semibold text-lg mb-2">No subjects yet</h3>
              <p className="text-slate-500 text-sm mb-6">Add your first subject to start tracking attendance.</p>
              <button
                onClick={() => { setEditSubject(null); setShowAddModal(true); }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <FiPlus size={16} />
                Add Your First Subject
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject, i) => (
                <SubjectCard
                  key={subject._id}
                  subject={subject}
                  index={i}
                  onAttend={handleAttend}
                  onMiss={handleMiss}
                  onEdit={(s) => { setEditSubject(s); setShowAddModal(true); }}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chart panel */}
        <div className="xl:col-span-2 space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp size={18} className="text-indigo-400" />
              Attendance Overview
            </h3>
            {subjects.length > 0 ? (
              <AttendanceBarChart data={chartData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                Add subjects to see chart
              </div>
            )}
          </div>

          {/* AI Insights & Quick Stats */}
          <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="bg-indigo-500 p-1 rounded-md"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="white"/></svg></span>
              AI Quick Insights
            </h3>
            
            {subjects.length === 0 ? (
              <p className="text-slate-400 text-sm">Add subjects to get AI insights.</p>
            ) : (
              <div className="space-y-4">
                {totalSafeBunks > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-indigo-400 mt-0.5">💡</span>
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-300">Smart Planner</h4>
                      <p className="text-xs text-indigo-200/70 mt-1">You have {totalSafeBunks} safe bunks available across all subjects. Ask BunkBot how to best use them!</p>
                    </div>
                  </div>
                )}
                
                {atRisk.length > 0 ? (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <span className="text-red-400 mt-0.5">🚨</span>
                    <div>
                      <h4 className="text-sm font-semibold text-red-300">Critical Warning</h4>
                      <p className="text-xs text-red-200/70 mt-1">{atRisk[0].subjectName} needs your immediate attention. Don't miss the next class.</p>
                    </div>
                  </div>
                ) : overallPct >= 85 ? (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400 mt-0.5">🌟</span>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-300">Excellent Consistency</h4>
                      <p className="text-xs text-emerald-200/70 mt-1">Your attendance is trending well above average. Keep up the great work!</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-amber-400 mt-0.5">⚠️</span>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-300">Stay Focused</h4>
                      <p className="text-xs text-amber-200/70 mt-1">You're safe, but close to the 75% boundary. Avoid taking unnecessary bunks this week.</p>
                    </div>
                  </div>
                )}

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                  <div className="p-3 rounded-xl bg-slate-800/50">
                    <p className="text-xs text-slate-400 mb-1">Total Classes</p>
                    <p className="font-bold text-white text-lg">{totalClasses}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50">
                    <p className="text-xs text-slate-400 mb-1">Attended</p>
                    <p className="font-bold text-white text-lg">{totalAttended}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubjectFormModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditSubject(null); }}
        onSubmit={handleAddOrEdit}
        editSubject={editSubject}
        isLoading={modalLoading}
      />
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? All attendance data will be lost permanently."
        isLoading={modalLoading}
      />
    </DashboardLayout>
  );
};

export default Dashboard;

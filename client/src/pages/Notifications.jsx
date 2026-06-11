import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiFilter } from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import { subjectsAPI } from '../utils/api';
import { calcPercentage, calcSafeBunks, calcClassesNeeded } from '../utils/helpers';
import { toast } from '../components/common/Toast';

const Notifications = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [read, setRead] = useState(new Set());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await subjectsAPI.getAll();
        setSubjects(data);
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // Generate notifications from subject data
  const notifications = subjects.flatMap(s => {
    const pct = calcPercentage(s.attendedClasses, s.totalClasses);
    const notifs = [];
    if (s.totalClasses === 0) return [];

    if (pct < 60) {
      notifs.push({
        id: `${s._id}-critical`,
        type: 'critical',
        title: `Critical: ${s.subjectName}`,
        message: `Attendance at ${pct}% — critically below 75%. Attend every class immediately!`,
        time: 'Today',
        subject: s.subjectName,
      });
    } else if (pct < 75) {
      notifs.push({
        id: `${s._id}-warning`,
        type: 'warning',
        title: `Warning: ${s.subjectName}`,
        message: `Attendance at ${pct}% — below 75%. You need ${calcClassesNeeded(s.attendedClasses, s.totalClasses)} more classes.`,
        time: 'Today',
        subject: s.subjectName,
      });
    } else if (pct >= 85) {
      notifs.push({
        id: `${s._id}-excellent`,
        type: 'success',
        title: `Excellent: ${s.subjectName}`,
        message: `Great job! ${pct}% attendance. You can safely bunk ${calcSafeBunks(s.attendedClasses, s.totalClasses)} classes.`,
        time: 'Today',
        subject: s.subjectName,
      });
    } else {
      notifs.push({
        id: `${s._id}-safe`,
        type: 'info',
        title: `Safe: ${s.subjectName}`,
        message: `${pct}% — You can safely miss ${calcSafeBunks(s.attendedClasses, s.totalClasses)} more classes.`,
        time: 'Today',
        subject: s.subjectName,
      });
    }
    return notifs;
  });

  const iconMap = {
    critical: { Icon: FiAlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    warning: { Icon: FiAlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    success: { Icon: FiCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    info: { Icon: FiInfo, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  };

  const filtered = notifications.filter(n =>
    filter === 'all' ? true :
    filter === 'unread' ? !read.has(n.id) :
    n.type === filter
  );

  const markAllRead = () => setRead(new Set(notifications.map(n => n.id)));

  const unreadCount = notifications.filter(n => !read.has(n.id)).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">Attendance alerts and updates</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm py-2">
            Mark all as read
          </button>
        )}
      </div>

      {/* Bell animation */}
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
          className="w-20 h-20 glass-card rounded-full flex items-center justify-center"
        >
          <FiBell size={36} className="text-indigo-400" />
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', 'unread', 'critical', 'warning', 'success', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded-full w-1/3" />
                  <div className="h-3 bg-white/5 rounded-full w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <FiBell size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-slate-300 font-semibold">No notifications</h3>
          <p className="text-slate-500 text-sm mt-2">
            {subjects.length === 0 ? 'Add subjects to receive alerts.' : 'You\'re all caught up!'}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {filtered.map((notif, i) => {
              const { Icon, color, bg } = iconMap[notif.type];
              const isUnread = !read.has(notif.id);
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setRead(prev => new Set([...prev, notif.id]))}
                  className={`glass-card rounded-2xl p-5 border ${bg} cursor-pointer hover:-translate-y-0.5 transition-all ${
                    isUnread ? 'border-l-4' : 'opacity-70'
                  }`}
                  style={isUnread ? { borderLeftColor: color.replace('text-', '').replace('-400', '') } : {}}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${bg}`}>
                      <Icon size={20} className={color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-white font-semibold text-sm">{notif.title}</h4>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-500 text-xs">{notif.time}</span>
                          {isUnread && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </DashboardLayout>
  );
};

export default Notifications;

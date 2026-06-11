import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiBook, FiTrendingUp, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from '../components/common/Toast';
import { formatDate } from '../utils/helpers';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleSave = () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    updateUser({ name });
    toast.success('Profile updated! ✅');
    setEditing(false);
  };

  const avatarColors = ['from-indigo-500 to-purple-600', 'from-cyan-500 to-blue-600', 'from-pink-500 to-rose-600', 'from-amber-500 to-orange-600'];
  const colorIndex = user?.name?.charCodeAt(0) % avatarColors.length || 0;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="max-w-2xl">
        {/* Avatar & Name card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 mb-6 text-center"
        >
          <div className="relative inline-block mb-6">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto`}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <RiGraduationCapLine size={14} className="text-white" />
            </div>
          </div>

          {editing ? (
            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-center text-lg font-bold"
                autoFocus
              />
              <button onClick={handleSave} className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
                <FiSave size={18} />
              </button>
              <button onClick={() => { setEditing(false); setName(user?.name); }} className="p-2.5 rounded-xl glass hover:bg-white/10 text-slate-400 transition-colors">
                <FiX size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                <FiEdit2 size={16} />
              </button>
            </div>
          )}

          <p className="text-slate-400 text-sm mt-2">{user?.email}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <RiGraduationCapLine size={14} />
            Student
          </div>
        </motion.div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: FiUser, label: 'Full Name', value: user?.name || '—', color: '#6366f1' },
            { icon: FiMail, label: 'Email Address', value: user?.email || '—', color: '#06b6d4' },
            { icon: FiCalendar, label: 'Member Since', value: formatDate(), color: '#8b5cf6' },
            { icon: FiTrendingUp, label: 'Account Status', value: 'Active & Verified', color: '#10b981' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className="text-white font-medium text-sm mt-0.5">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-5 rounded-2xl glass border border-purple-500/20"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FiBook size={18} className="text-purple-400" />
            Pro Tips
          </h3>
          <ul className="space-y-2">
            {[
              'Mark attendance immediately after each class for accuracy.',
              'Keep overall attendance above 85% for maximum safe bunks.',
              'Check the analytics page for deeper insights into your attendance.',
            ].map((tip, i) => (
              <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

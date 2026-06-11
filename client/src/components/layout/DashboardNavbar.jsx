import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiMenu, FiX, FiHome, FiBook, FiBarChart2, FiUser, FiLogOut, FiShield } from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const DashboardNavbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const mobileLinks = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/subjects', icon: FiBook, label: 'Subjects' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const activeMobileLinks = [
    ...mobileLinks,
    ...(user?.isAdmin ? [{ path: '/admin/users', icon: FiShield, label: 'Users' }] : [])
  ];

  return (
    <>
      <header className="h-16 glass-dark border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <FiMenu size={20} />
          </button>
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <RiGraduationCapLine className="text-white text-sm" />
            </div>
            <span className="font-bold text-white text-sm">BunkMeter</span>
          </div>
        </div>

        {/* Right: Notifications + Avatar */}
        <div className="flex items-center gap-2 ml-auto">
          <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <FiBell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>
          <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 glass-dark border-r border-white/5 z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <RiGraduationCapLine className="text-white text-lg" />
                  </div>
                  <span className="font-bold text-white text-lg">BunkMeter</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-4 flex-1 space-y-1">
                {activeMobileLinks.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}
              </div>

              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user?.name}</p>
                    <p className="text-slate-500 text-xs">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <FiLogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardNavbar;

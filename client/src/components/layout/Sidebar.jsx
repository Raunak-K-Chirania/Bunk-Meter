import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiBook, FiBarChart2, FiBell, FiLogOut, FiChevronLeft,
  FiChevronRight, FiUser, FiSettings, FiMenu, FiShield
} from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/subjects', icon: FiBook, label: 'Subjects' },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { path: '/notifications', icon: FiBell, label: 'Notifications' },
  { path: '/profile', icon: FiUser, label: 'Profile' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const activeNavItems = [
    ...navItems,
    ...(user?.isAdmin ? [{ path: '/admin/users', icon: FiShield, label: 'Users' }] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full glass-dark border-r border-white/5 z-40 flex flex-col overflow-hidden hidden md:flex"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 border-b border-white/5">
        <div className="w-9 h-9 min-w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <RiGraduationCapLine className="text-white text-lg" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-white text-lg font-outfit whitespace-nowrap"
            >
              BunkMeter
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {activeNavItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/40 to-purple-600/30 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={`min-w-5 ${isActive ? 'text-indigo-400' : ''}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 min-w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="min-w-0 flex-1"
              >
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
        >
          <FiLogOut size={18} className="min-w-5 group-hover:rotate-12 transition-transform" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-500 transition-colors z-50"
      >
        {isCollapsed ? <FiChevronRight size={12} /> : <FiChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;

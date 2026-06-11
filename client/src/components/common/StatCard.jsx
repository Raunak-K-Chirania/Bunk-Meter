import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getProgressColor } from '../../utils/helpers';

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const start = 0;
    const end = parseFloat(value);
    const startTime = Date.now();

    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (ref.current) {
        ref.current.textContent = Number.isInteger(end)
          ? Math.round(current).toString()
          : current.toFixed(1);
      }

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }, [value, duration]);

  return <span ref={ref}>0</span>;
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, gradient, suffix = '', index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative glass-card rounded-2xl p-6 overflow-hidden group cursor-default"
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}15, transparent 70%)` }}
      />

      {/* Decorative circle */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-xl"
        style={{ background: color }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `${color}20`, border: `1px solid ${color}30` }}
          >
            <Icon size={22} style={{ color }} />
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-lg`} style={{ background: `${color}15`, color }}>
            {subtitle}
          </div>
        </div>

        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">
          <AnimatedCounter value={value} />
          {suffix}
        </h3>
      </div>
    </motion.div>
  );
};

export const AttendanceStatCard = ({ title, value, icon: Icon, color, index = 0, showProgress = false }) => {
  const percentage = typeof value === 'number' ? value : parseFloat(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-6 group cursor-default overflow-hidden relative"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={22} style={{ color }} />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-white">
            <AnimatedCounter value={percentage} />
            {showProgress ? '%' : ''}
          </h3>
        </div>
      </div>
      {showProgress && (
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 1.5, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
            className={`h-1.5 rounded-full ${getProgressColor(percentage)}`}
          />
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;

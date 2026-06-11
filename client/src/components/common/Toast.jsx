import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';

let toastQueue = [];
let listeners = [];

const notify = (message, type = 'info', duration = 4000) => {
  const id = Date.now() + Math.random();
  const toast = { id, message, type, duration };
  toastQueue = [...toastQueue, toast];
  listeners.forEach(fn => fn([...toastQueue]));
  return id;
};

export const toast = {
  success: (msg, dur) => notify(msg, 'success', dur),
  error: (msg, dur) => notify(msg, 'error', dur),
  warning: (msg, dur) => notify(msg, 'warning', dur),
  info: (msg, dur) => notify(msg, 'info', dur),
};

const icons = {
  success: { Icon: FiCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  error: { Icon: FiAlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  warning: { Icon: FiAlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  info: { Icon: FiInfo, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
};

const ToastItem = ({ toast: t, onRemove }) => {
  const { Icon, color, bg } = icons[t.type] || icons.info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(t.id), t.duration || 4000);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      className={`flex items-center gap-3 p-4 rounded-xl border ${bg} backdrop-blur-xl shadow-2xl max-w-sm w-full`}
    >
      <Icon size={20} className={`${color} shrink-0`} />
      <p className="text-white text-sm flex-1 font-medium">{t.message}</p>
      <button onClick={() => onRemove(t.id)} className="text-slate-500 hover:text-white transition-colors shrink-0">
        <FiX size={16} />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (newToasts) => setToasts(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const remove = (id) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    setToasts([...toastQueue]);
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default toast;

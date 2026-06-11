import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiTrash2, FiEdit2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import { calcPercentage, calcSafeBunks, calcClassesNeeded, getProgressColor, getStatusColor } from '../../utils/helpers';

const SubjectCard = ({ subject, onAttend, onMiss, onDelete, onEdit, index = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const { subjectName, attendedClasses, totalClasses } = subject;
  const percentage = calcPercentage(attendedClasses, totalClasses);
  const safeBunks = calcSafeBunks(attendedClasses, totalClasses);
  const classesNeeded = calcClassesNeeded(attendedClasses, totalClasses);
  const isSafe = percentage >= 75;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -2 }}
      layout
      className="glass-card rounded-2xl overflow-hidden group"
    >
      {/* Top color bar */}
      <div
        className={`h-1 w-full transition-all duration-700 ${
          isSafe
            ? percentage >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
            : 'bg-gradient-to-r from-green-500 to-emerald-500'
            : percentage >= 60
            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
            : 'bg-gradient-to-r from-red-500 to-rose-500'
        }`}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSafe ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <FaGraduationCap size={18} className={isSafe ? 'text-emerald-400' : 'text-red-400'} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base leading-tight">{subjectName}</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                {attendedClasses} / {totalClasses} classes
              </p>
            </div>
          </div>

          {/* Percentage badge */}
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${getStatusColor(percentage)}`}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 1.2, delay: 0.2 + index * 0.08, ease: 'easeOut' }}
            className={`progress-fill ${getProgressColor(percentage)}`}
          />
        </div>

        {/* Status badge */}
        <div className="mb-4">
          {isSafe ? (
            <span className="badge-success text-xs">
              ✓ Can safely bunk {safeBunks} class{safeBunks !== 1 ? 'es' : ''}
            </span>
          ) : totalClasses === 0 ? (
            <span className="badge-info text-xs">No classes recorded yet</span>
          ) : (
            <span className="badge-danger text-xs">
              ⚠ Need {classesNeeded} more class{classesNeeded !== 1 ? 'es' : ''} to reach 75%
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAttend(subject._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-sm transition-all border border-emerald-500/20 hover:border-emerald-500/40"
          >
            <FiCheckCircle size={15} />
            Attended
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onMiss(subject._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-sm transition-all border border-red-500/20 hover:border-red-500/40"
          >
            <FiXCircle size={15} />
            Missed
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(subject)}
            className="p-2 rounded-xl glass hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <FiEdit2 size={15} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(subject._id)}
            className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
          >
            <FiTrash2 size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SubjectCard;

import React from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-6 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-white/5 rounded-full animate-pulse w-1/2" />
        <div className="h-6 bg-white/5 rounded-full animate-pulse w-3/4" />
      </div>
    </div>
    <div className="h-2 bg-white/5 rounded-full animate-pulse" />
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass-card rounded-2xl p-5 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-white/5 rounded-full w-36" />
            <div className="h-3 bg-white/5 rounded-full w-24" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-white/5 rounded-lg" />
            <div className="h-8 w-16 bg-white/5 rounded-lg" />
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full" />
        <div className="h-3 bg-white/5 rounded-full w-40" />
      </div>
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const LoadingSpinner = ({ size = 'md', color = 'indigo' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-${color}-500/30 border-t-${color}-500 rounded-full animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-slate-400 text-sm animate-pulse">Loading...</p>
    </motion.div>
  </div>
);

export { SkeletonCard };

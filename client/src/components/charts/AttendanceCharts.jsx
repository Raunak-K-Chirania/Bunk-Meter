import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, CartesianGrid, RadarChart,
  Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { motion } from 'framer-motion';

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(20px)',
    color: '#fff',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  labelStyle: { color: '#94a3b8' },
};

const axisStyle = { fill: '#64748b', fontSize: 11 };

export const AttendanceBarChart = ({ data }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'Attendance']} />
        <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.percentage >= 85
                  ? '#10b981'
                  : entry.percentage >= 75
                  ? '#22c55e'
                  : entry.percentage >= 60
                  ? '#f59e0b'
                  : '#ef4444'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.08 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export const AttendancePieChart = ({ data }) => {
  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            innerRadius={40}
            dataKey="value"
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'Attendance']} />
          <Legend
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export const AttendanceLineChart = ({ data }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'Attendance']} />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="url(#lineGrad)"
          strokeWidth={3}
          dot={{ fill: '#6366f1', r: 5, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 7, fill: '#8b5cf6' }}
        />
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  </motion.div>
);

export const AttendanceRadarChart = ({ data }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.05)" />
        <PolarAngleAxis dataKey="subject" tick={axisStyle} />
        <Radar name="Attendance" dataKey="percentage" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'Attendance']} />
      </RadarChart>
    </ResponsiveContainer>
  </motion.div>
);

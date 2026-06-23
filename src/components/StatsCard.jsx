/**
 * StatsCard — Animated glassmorphism stats card with glow effects.
 */

import { motion } from 'framer-motion';

const colorMap = {
  blue: {
    iconBg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.2)',
    glow: '0 0 25px rgba(59,130,246,0.2)',
    accent: '#3b82f6',
  },
  cyan: {
    iconBg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.2)',
    glow: '0 0 25px rgba(6,182,212,0.2)',
    accent: '#06b6d4',
  },
  emerald: {
    iconBg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.2)',
    glow: '0 0 25px rgba(16,185,129,0.2)',
    accent: '#10b981',
  },
  amber: {
    iconBg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
    glow: '0 0 25px rgba(245,158,11,0.2)',
    accent: '#f59e0b',
  },
  red: {
    iconBg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.2)',
    glow: '0 0 25px rgba(239,68,68,0.2)',
    accent: '#ef4444',
  },
  purple: {
    iconBg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.2)',
    glow: '0 0 25px rgba(139,92,246,0.2)',
    accent: '#8b5cf6',
  },
};

export default function StatsCard({ title, value, subtitle, icon, color = 'blue', delay = 0 }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, boxShadow: c.glow }}
      className="glass-card p-6 transition-all duration-500 cursor-default"
      style={{ borderColor: c.border }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: c.iconBg }}
        >
          {icon}
        </div>
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: c.accent }}
        />
      </div>
      <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
      <p className="text-sm text-slate-400 font-medium">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

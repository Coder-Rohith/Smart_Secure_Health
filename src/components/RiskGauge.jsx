/**
 * RiskGauge — Animated SVG circular gauge for risk score visualization.
 * Color transitions: green (low) → amber (moderate) → red (high).
 */

import { motion } from 'framer-motion';

export default function RiskGauge({ score = 0, size = 160 }) {
  const getTheme = (s) => {
    if (s < 30) return { color: '#10b981', label: 'Low Risk', bg: 'rgba(16,185,129,0.12)' };
    if (s < 60) return { color: '#f59e0b', label: 'Moderate Risk', bg: 'rgba(245,158,11,0.12)' };
    return { color: '#ef4444', label: 'High Risk', bg: 'rgba(239,68,68,0.12)' };
  };

  const { color, label, bg } = getTheme(score);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: `0 0 30px ${color}33, 0 0 60px ${color}11`,
          }}
          transition={{ duration: 1 }}
        />

        <svg
          className="w-full h-full"
          viewBox="0 0 140 140"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="rgba(59,130,246,0.08)"
            strokeWidth="10"
          />

          {/* Background subtle marks */}
          {[...Array(20)].map((_, i) => {
            const angle = (i / 20) * 360;
            const rad = (angle * Math.PI) / 180;
            const x1 = 70 + 52 * Math.cos(rad);
            const y1 = 70 + 52 * Math.sin(rad);
            const x2 = 70 + 56 * Math.cos(rad);
            const y2 = 70 + 56 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(59,130,246,0.12)"
                strokeWidth="1"
              />
            );
          })}

          {/* Animated progress arc */}
          <motion.circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold tracking-tight"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Label badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
        style={{ color, backgroundColor: bg }}
      >
        {label}
      </motion.div>
    </div>
  );
}

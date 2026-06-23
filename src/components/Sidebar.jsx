/**
 * Sidebar — Main navigation with animated links, user profile, and logout.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', end: true },
  { path: '/predict', label: 'Prediction', icon: '🔬', end: false },
  { path: '/analytics', label: 'Analytics', icon: '📈', end: false },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 180 }}
      className="fixed left-0 top-0 h-screen w-[260px] z-50 flex flex-col
                 bg-[rgba(8,11,21,0.95)] backdrop-blur-2xl
                 border-r border-[rgba(59,130,246,0.1)]"
    >
      {/* ── Logo ── */}
      <div className="p-6 border-b border-[rgba(59,130,246,0.08)]">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500
                       flex items-center justify-center text-xl
                       shadow-[0_0_25px_rgba(59,130,246,0.4)]"
          >
            🏥
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">HealthAI</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
              Smart Diagnostics
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-3 px-4">
          Menu
        </p>
        {navItems.map((item, idx) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <motion.span
              whileHover={{ scale: 1.2 }}
              className="text-xl w-7 text-center"
            >
              {item.icon}
            </motion.span>
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Security Badge ── */}
      <div className="px-4 pb-3">
        <div className="glass-card p-3 flex items-center gap-2">
          <span className="text-green-400 text-xs">🔒</span>
          <div>
            <p className="text-[10px] text-green-400 font-semibold">ENCRYPTED</p>
            <p className="text-[9px] text-slate-500">AES-256 + JWT Auth</p>
          </div>
        </div>
      </div>

      {/* ── User Profile ── */}
      <div className="p-4 border-t border-[rgba(59,130,246,0.08)]">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600
                         flex items-center justify-center text-sm font-bold text-white
                         shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'doctor' ? 'bg-cyan-400' : 'bg-blue-400'}`} />
              {user?.role || 'user'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          id="logout-btn"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                     text-sm text-slate-400 border border-[rgba(239,68,68,0.15)]
                     hover:text-red-400 hover:bg-[rgba(239,68,68,0.08)]
                     hover:border-[rgba(239,68,68,0.3)]
                     transition-all duration-300"
        >
          <span>↪</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}

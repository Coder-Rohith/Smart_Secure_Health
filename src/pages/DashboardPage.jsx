/**
 * DashboardPage — Overview with stats cards, recent predictions table,
 * and quick disease distribution chart.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import StatsCard from '../components/StatsCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch {
      // Stats may be empty for new users
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats ? {
    labels: ['Heart Disease', 'No Disease'],
    datasets: [{
      data: [
        stats.disease_distribution['Heart Disease'] || 0,
        stats.disease_distribution['No Disease'] || 0,
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(16, 185, 129, 0.7)',
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 20,
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 18, 35, 0.9)',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
        cornerRadius: 12,
        padding: 12,
      },
    },
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">
          {greeting()}, <span className="text-gradient">{user?.name || 'User'}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm">
          Here's your healthcare analytics overview
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          title="Total Predictions"
          value={stats?.total_predictions || 0}
          icon="🔬"
          color="blue"
          delay={0.1}
          subtitle="All-time analyses"
        />
        <StatsCard
          title="Avg Risk Score"
          value={stats?.average_risk_score || 0}
          icon="💓"
          color={stats?.average_risk_score > 60 ? 'red' : stats?.average_risk_score > 30 ? 'amber' : 'emerald'}
          delay={0.2}
          subtitle="Population average"
        />
        <StatsCard
          title="Disease Detected"
          value={stats?.disease_distribution?.['Heart Disease'] || 0}
          icon="⚠️"
          color="red"
          delay={0.3}
          subtitle="Positive diagnoses"
        />
        <StatsCard
          title="Feedback Score"
          value={`${stats?.feedback_stats?.satisfaction_rate || 0}%`}
          icon="📊"
          color="cyan"
          delay={0.4}
          subtitle={`${stats?.feedback_stats?.total || 0} total responses`}
        />
      </div>

      {/* Main Grid: Chart + Recent Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disease Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card glow-border p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Disease Distribution</h3>
          <p className="text-xs text-slate-500 mb-6">Prediction outcomes breakdown</p>

          {chartData && (chartData.datasets[0].data[0] > 0 || chartData.datasets[0].data[1] > 0) ? (
            <div className="h-[240px] flex items-center justify-center">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm text-slate-500">No predictions yet</p>
                <p className="text-xs text-slate-600">Run your first analysis to see data</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent Predictions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card glow-border p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Recent Predictions</h3>
          <p className="text-xs text-slate-500 mb-4">Latest diagnostic analyses</p>

          {stats?.recent_predictions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Age</th>
                    <th>Sex</th>
                    <th>Result</th>
                    <th>Risk</th>
                    <th>Confidence</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_predictions.map((p) => (
                    <tr key={p.id}>
                      <td className="font-mono text-slate-500">#{p.id}</td>
                      <td>{p.age}</td>
                      <td>{p.sex}</td>
                      <td>
                        <span className={`badge ${p.result === 'Heart Disease' ? 'badge-danger' : 'badge-success'}`}>
                          {p.result}
                        </span>
                      </td>
                      <td>
                        <span className={
                          p.risk_score > 60 ? 'text-red-400' :
                          p.risk_score > 30 ? 'text-amber-400' :
                          'text-emerald-400'
                        }>
                          {p.risk_score}
                        </span>
                      </td>
                      <td>{p.confidence}%</td>
                      <td className="text-slate-500 text-xs">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-3">🩺</p>
                <p className="text-sm text-slate-500">No predictions recorded</p>
                <p className="text-xs text-slate-600">Navigate to Prediction to get started</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Risk Factors Summary */}
      {stats && stats.total_predictions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass-card glow-border p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Population Risk Factors</h3>
          <p className="text-xs text-slate-500 mb-6">Average values across all predictions</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Avg Age', value: stats.risk_factors.avg_age, unit: 'yrs', icon: '🎂' },
              { label: 'Avg BP', value: stats.risk_factors.avg_bp, unit: 'mmHg', icon: '💉' },
              { label: 'Avg Cholesterol', value: stats.risk_factors.avg_cholesterol, unit: 'mg/dl', icon: '🧪' },
              { label: 'Avg Heart Rate', value: stats.risk_factors.avg_heart_rate, unit: 'bpm', icon: '💓' },
              { label: 'Avg ST Depression', value: stats.risk_factors.avg_oldpeak, unit: 'mm', icon: '📉' },
            ].map((item, i) => (
              <div key={i} className="bg-[rgba(10,13,26,0.5)] rounded-xl p-4 border border-[rgba(59,130,246,0.08)]">
                <span className="text-lg">{item.icon}</span>
                <p className="text-xl font-bold text-white mt-2">
                  {item.value} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* RL Engine Status */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 glass-card p-4 border border-[rgba(6,182,212,0.15)] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(6,182,212,0.1)] flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <p className="text-sm font-semibold text-white">RL Engine Status</p>
              <p className="text-xs text-slate-500">
                Exploration Rate: {(stats.exploration_rate * 100).toFixed(1)}% | 
                Feedback Collected: {stats.feedback_stats?.total || 0}
              </p>
            </div>
          </div>
          <div className="badge badge-info">Active</div>
        </motion.div>
      )}
    </div>
  );
}

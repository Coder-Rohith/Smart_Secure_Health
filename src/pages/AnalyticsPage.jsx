/**
 * AnalyticsPage — Charts and analytics dashboard with disease distribution,
 * risk factors, age group analysis, and RL performance metrics.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 11 },
        usePointStyle: true,
        pointStyleWidth: 8,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 18, 35, 0.95)',
      borderColor: 'rgba(59, 130, 246, 0.2)',
      borderWidth: 1,
      titleFont: { family: 'Inter', weight: '600', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      cornerRadius: 10,
      padding: 12,
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      grid: { color: 'rgba(59, 130, 246, 0.05)' },
      border: { color: 'rgba(59, 130, 246, 0.1)' },
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      grid: { color: 'rgba(59, 130, 246, 0.05)' },
      border: { color: 'rgba(59, 130, 246, 0.1)' },
    },
  },
};

export default function AnalyticsPage() {
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
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats || stats.total_predictions === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            <span className="text-gradient">Analytics</span> Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Comprehensive healthcare intelligence insights</p>
        </motion.div>
        <div className="glass-card glow-border p-16 flex flex-col items-center justify-center">
          <p className="text-5xl mb-4">📊</p>
          <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-sm text-slate-400 text-center max-w-md">
            Run predictions from the Prediction page to generate analytics data.
            Charts will populate automatically as you use the system.
          </p>
        </div>
      </div>
    );
  }

  // ── Chart Data ──

  const diseaseBarData = {
    labels: ['Heart Disease', 'No Disease'],
    datasets: [{
      label: 'Predictions',
      data: [
        stats.disease_distribution['Heart Disease'] || 0,
        stats.disease_distribution['No Disease'] || 0,
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.6)',
        'rgba(16, 185, 129, 0.6)',
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const ageGroupData = {
    labels: Object.keys(stats.age_distribution || {}),
    datasets: [{
      label: 'Patients',
      data: Object.values(stats.age_distribution || {}),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const riskFactorsDoughnut = {
    labels: ['Blood Pressure', 'Cholesterol', 'Heart Rate', 'ST Depression'],
    datasets: [{
      data: [
        stats.risk_factors.avg_bp,
        stats.risk_factors.avg_cholesterol,
        stats.risk_factors.avg_heart_rate,
        stats.risk_factors.avg_oldpeak * 100,
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(139, 92, 246, 0.6)',
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(139, 92, 246, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const monthlyLineData = {
    labels: stats.monthly_predictions?.map((m) => m.month) || [],
    datasets: [{
      label: 'Predictions',
      data: stats.monthly_predictions?.map((m) => m.count) || [],
      borderColor: 'rgba(6, 182, 212, 1)',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgba(6, 182, 212, 1)',
      pointBorderColor: '#050510',
      pointBorderWidth: 2,
    }],
  };

  const feedbackDoughnut = {
    labels: ['Positive', 'Negative'],
    datasets: [{
      data: [
        stats.feedback_stats?.positive || 0,
        stats.feedback_stats?.negative || 0,
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.6)',
        'rgba(239, 68, 68, 0.6)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...chartDefaults.plugins,
      legend: { ...chartDefaults.plugins.legend, position: 'bottom' },
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          <span className="text-gradient">Analytics</span> Dashboard
        </h1>
        <p className="text-slate-400 text-sm">
          Comprehensive healthcare intelligence — {stats.total_predictions} predictions analyzed
        </p>
      </motion.div>

      {/* Top Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Analyses', value: stats.total_predictions, icon: '🔬', color: 'text-blue-400' },
          { label: 'Avg Risk Score', value: stats.average_risk_score, icon: '💓', color: stats.average_risk_score > 60 ? 'text-red-400' : 'text-amber-400' },
          { label: 'Avg Confidence', value: `${stats.average_confidence}%`, icon: '🎯', color: 'text-cyan-400' },
          { label: 'Satisfaction', value: `${stats.feedback_stats?.satisfaction_rate || 0}%`, icon: '⭐', color: 'text-emerald-400' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="glass-card p-4 border border-[rgba(59,130,246,0.1)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Disease Distribution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card glow-border p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Disease Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Prediction outcomes by category</p>
          <div className="h-[280px]">
            <Bar data={diseaseBarData} options={chartDefaults} />
          </div>
        </motion.div>

        {/* Age Group Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card glow-border p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Age Group Analysis</h3>
          <p className="text-xs text-slate-500 mb-4">Patient distribution by age range</p>
          <div className="h-[280px]">
            <Bar data={ageGroupData} options={chartDefaults} />
          </div>
        </motion.div>

        {/* Risk Factors Doughnut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card glow-border p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Risk Factor Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Average risk factor values</p>
          <div className="h-[280px] flex items-center justify-center">
            <Doughnut data={riskFactorsDoughnut} options={doughnutOptions} />
          </div>
        </motion.div>

        {/* Monthly Predictions Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card glow-border p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Prediction Trends</h3>
          <p className="text-xs text-slate-500 mb-4">Monthly prediction volume</p>
          <div className="h-[280px]">
            {stats.monthly_predictions?.length > 0 ? (
              <Line data={monthlyLineData} options={chartDefaults} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-slate-500">More data needed for trend analysis</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Feedback + RL Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card glow-border p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Feedback Analysis</h3>
          <p className="text-xs text-slate-500 mb-4">Treatment recommendation effectiveness</p>

          {stats.feedback_stats?.total > 0 ? (
            <div className="flex items-center gap-8">
              <div className="h-[200px] w-[200px]">
                <Doughnut data={feedbackDoughnut} options={doughnutOptions} />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Total Feedback</p>
                  <p className="text-2xl font-bold text-white">{stats.feedback_stats.total}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Satisfaction Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.feedback_stats.satisfaction_rate}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm text-slate-500">No feedback collected yet</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* RL Engine Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 border border-[rgba(6,182,212,0.15)]"
        >
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">RL Engine Insights</h3>
            <span className="badge badge-info text-[10px]">AI</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Reinforcement Learning adaptation metrics</p>

          <div className="space-y-4">
            <div className="bg-[rgba(10,13,26,0.5)] rounded-xl p-4 border border-[rgba(59,130,246,0.08)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Exploration Rate</span>
                <span className="text-sm font-bold text-cyan-400">
                  {(stats.exploration_rate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-[rgba(59,130,246,0.1)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.exploration_rate * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">
                Lower = more exploitation of best-known treatments
              </p>
            </div>

            {/* Treatment success rates */}
            {stats.rl_stats && Object.keys(stats.rl_stats).length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold">Treatment Success Rates</p>
                {Object.entries(stats.rl_stats).map(([disease, treatments]) => (
                  <div key={disease}>
                    <p className="text-xs text-slate-500 mb-1">{disease}</p>
                    {Object.entries(treatments).slice(0, 3).map(([treatment, data]) => (
                      <div key={treatment} className="flex items-center gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-slate-400 truncate">{treatment}</p>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                          {data.success_rate}%
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">Submit feedback to train the RL engine</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

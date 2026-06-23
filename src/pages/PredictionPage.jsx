/**
 * PredictionPage — Patient input form, real-time risk score,
 * disease prediction results, treatment recommendations, and feedback buttons.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import RiskGauge from '../components/RiskGauge';

const fieldConfig = [
  { name: 'age', label: 'Age', min: 1, max: 120, defaultVal: 50, unit: 'years', desc: 'Patient age' },
  { name: 'sex', label: 'Sex', min: 0, max: 1, defaultVal: 1, unit: '0=F 1=M', desc: '0=Female, 1=Male' },
  { name: 'cp', label: 'Chest Pain Type', min: 0, max: 3, defaultVal: 0, unit: '0-3', desc: '0=Typical, 1=Atypical, 2=Non-anginal, 3=Asymptomatic' },
  { name: 'trestbps', label: 'Resting BP', min: 50, max: 300, defaultVal: 120, unit: 'mmHg', desc: 'Resting blood pressure' },
  { name: 'chol', label: 'Cholesterol', min: 50, max: 600, defaultVal: 200, unit: 'mg/dl', desc: 'Serum cholesterol level' },
  { name: 'fbs', label: 'Fasting Blood Sugar', min: 0, max: 1, defaultVal: 0, unit: '>120mg/dl', desc: '1 if > 120 mg/dl, else 0' },
  { name: 'restecg', label: 'Resting ECG', min: 0, max: 2, defaultVal: 0, unit: '0-2', desc: 'ECG results (0=Normal, 1=ST-T abnormality, 2=LV hypertrophy)' },
  { name: 'thalach', label: 'Max Heart Rate', min: 50, max: 250, defaultVal: 150, unit: 'bpm', desc: 'Maximum heart rate achieved' },
  { name: 'exang', label: 'Exercise Angina', min: 0, max: 1, defaultVal: 0, unit: '0/1', desc: '1 if exercise induced angina' },
  { name: 'oldpeak', label: 'ST Depression', min: 0, max: 10, defaultVal: 1.0, unit: 'mm', desc: 'ST depression induced by exercise', step: 0.1 },
  { name: 'slope', label: 'ST Slope', min: 0, max: 2, defaultVal: 1, unit: '0-2', desc: '0=Upsloping, 1=Flat, 2=Downsloping' },
  { name: 'ca', label: 'Major Vessels', min: 0, max: 4, defaultVal: 0, unit: '0-4', desc: 'Vessels colored by fluoroscopy' },
  { name: 'thal', label: 'Thalassemia', min: 0, max: 3, defaultVal: 1, unit: '0-3', desc: '0=Normal, 1=Fixed defect, 2=Reversible, 3=Other' },
];

const defaultForm = {};
fieldConfig.forEach((f) => { defaultForm[f.name] = f.defaultVal; });

export default function PredictionPage() {
  const [form, setForm] = useState({ ...defaultForm });
  const [result, setResult] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [predictionId, setPredictionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState({});
  const [error, setError] = useState('');

  // Real-time risk score calculation
  const liveRiskScore = useMemo(() => {
    let score = 0;
    if (form.age > 20) score += Math.min(25, (form.age - 20) * 0.5);
    if (form.trestbps > 120) score += Math.min(20, (form.trestbps - 120) * 0.3);
    if (form.chol > 200) score += Math.min(20, (form.chol - 200) * 0.1);
    if (form.thalach < 180) score += Math.min(15, (180 - form.thalach) * 0.15);
    if (form.exang === 1) score += 10;
    score += Math.min(10, form.cp * 3);
    return Math.min(100, Math.max(0, Math.round(score)));
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const field = fieldConfig.find((f) => f.name === name);
    const numVal = field?.step ? parseFloat(value) : parseInt(value, 10);
    setForm((prev) => ({ ...prev, [name]: isNaN(numVal) ? 0 : numVal }));
  };

  const handlePredict = async () => {
    setError('');
    setLoading(true);
    setResult(null);
    setTreatments([]);
    setFeedbackSent({});

    try {
      // Step 1: Predict
      const predData = await api.predict(form);
      setResult(predData);
      setPredictionId(predData.prediction_id);

      // Step 2: Get recommendations
      const recData = await api.recommend(predData.disease);
      setTreatments(recData.treatments || []);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (treatment, success) => {
    if (!predictionId || !result) return;
    try {
      await api.submitFeedback({
        prediction_id: predictionId,
        disease: result.disease,
        treatment,
        success,
      });
      setFeedbackSent((prev) => ({ ...prev, [treatment]: success }));
    } catch {
      // Silent fail for feedback
    }
  };

  const handleReset = () => {
    setForm({ ...defaultForm });
    setResult(null);
    setTreatments([]);
    setPredictionId(null);
    setFeedbackSent({});
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-1">
          Disease <span className="text-gradient">Prediction</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Enter patient parameters for AI-powered cardiovascular analysis
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Patient Input Form ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="glass-card glow-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Patient Parameters</h3>
                <p className="text-xs text-slate-500">13 clinical input features for the neural network</p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg
                           border border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.3)]
                           transition-all duration-300"
              >
                ↻ Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fieldConfig.map((field, idx) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>{field.label}</span>
                    <span className="text-[10px] text-slate-600 font-normal">{field.unit}</span>
                  </label>
                  <input
                    type="number"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    className="input-field text-sm"
                    title={field.desc}
                    id={`input-${field.name}`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]
                           text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Predict Button */}
            <motion.button
              onClick={handlePredict}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
              id="predict-btn"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing with Neural Network...
                </>
              ) : (
                <>🧠 Run AI Prediction</>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* ── RIGHT: Live Risk Score ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card glow-border p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white mb-1">Live Risk Score</h3>
            <p className="text-xs text-slate-500 mb-6">Real-time calculation</p>
            <RiskGauge score={liveRiskScore} />
            <div className="mt-6 w-full space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Blood Pressure</span>
                <span className={form.trestbps > 140 ? 'text-red-400' : 'text-emerald-400'}>
                  {form.trestbps} mmHg
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Cholesterol</span>
                <span className={form.chol > 240 ? 'text-red-400' : form.chol > 200 ? 'text-amber-400' : 'text-emerald-400'}>
                  {form.chol} mg/dl
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Heart Rate</span>
                <span className={form.thalach < 120 ? 'text-red-400' : 'text-emerald-400'}>
                  {form.thalach} bpm
                </span>
              </div>
            </div>
          </div>

          {/* Model info card */}
          <div className="glass-card p-4 mt-4 border border-[rgba(139,92,246,0.15)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🧠</span>
              <p className="text-xs font-semibold text-white">Deep Learning Model</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              MLPClassifier neural network with hidden layers (20, 10). 
              Trained on cardiovascular disease dataset with 13 clinical features.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── RESULTS SECTION ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Prediction Result */}
            <div className={`glass-card p-6 border ${
              result.disease === 'Heart Disease'
                ? 'border-[rgba(239,68,68,0.3)] glow-red'
                : 'border-[rgba(16,185,129,0.3)] glow-emerald'
            }`}>
              <h3 className="text-lg font-semibold text-white mb-4">Prediction Result</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                  result.disease === 'Heart Disease'
                    ? 'bg-[rgba(239,68,68,0.15)]'
                    : 'bg-[rgba(16,185,129,0.15)]'
                }`}>
                  {result.disease === 'Heart Disease' ? '🫀' : '✅'}
                </div>
                <div>
                  <h4 className={`text-2xl font-bold ${
                    result.disease === 'Heart Disease' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {result.disease}
                  </h4>
                  <p className="text-sm text-slate-400">
                    Confidence: <span className="text-white font-semibold">{result.confidence}%</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[rgba(10,13,26,0.5)] rounded-xl p-3 border border-[rgba(59,130,246,0.08)]">
                  <p className="text-xs text-slate-500">Risk Score</p>
                  <p className={`text-xl font-bold ${
                    result.risk_score > 60 ? 'text-red-400' :
                    result.risk_score > 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {result.risk_score}/100
                  </p>
                </div>
                <div className="bg-[rgba(10,13,26,0.5)] rounded-xl p-3 border border-[rgba(59,130,246,0.08)]">
                  <p className="text-xs text-slate-500">Model Confidence</p>
                  <p className="text-xl font-bold text-blue-400">{result.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Treatment Recommendations */}
            <div className="glass-card p-6 border border-[rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
                <span className="badge badge-info text-[10px]">RL-Powered</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Personalized treatments adapted via reinforcement learning
              </p>

              <div className="space-y-3">
                {treatments.map((treatment, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="bg-[rgba(10,13,26,0.5)] rounded-xl p-4 border border-[rgba(59,130,246,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-cyan-400 mt-0.5 text-sm">●</span>
                        <p className="text-sm text-slate-200 leading-relaxed">{treatment}</p>
                      </div>

                      {/* Feedback buttons */}
                      {feedbackSent[treatment] !== undefined ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                          feedbackSent[treatment] === 1
                            ? 'text-emerald-400 bg-[rgba(16,185,129,0.1)]'
                            : 'text-red-400 bg-[rgba(239,68,68,0.1)]'
                        }`}>
                          {feedbackSent[treatment] === 1 ? '✓ Helpful' : '✗ Not helpful'}
                        </span>
                      ) : (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleFeedback(treatment, 1)}
                            className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]
                                       text-emerald-400 hover:bg-[rgba(16,185,129,0.2)]
                                       transition-all duration-200 text-sm flex items-center justify-center"
                            title="Helpful"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleFeedback(treatment, 0)}
                            className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]
                                       text-red-400 hover:bg-[rgba(239,68,68,0.2)]
                                       transition-all duration-200 text-sm flex items-center justify-center"
                            title="Not helpful"
                          >
                            👎
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

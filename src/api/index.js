/**
 * API Client Module
 * Centralized HTTP client for all backend communication.
 * Automatically attaches JWT tokens to authenticated requests.
 */

const API_URL = 'http://127.0.0.1:8000';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Request failed');
  }
  return data;
}

export const api = {
  // ── Authentication ──────────────────────────
  async login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(email, name, password, role = 'user') {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, role }),
    });
    return handleResponse(res);
  },

  // ── Prediction (Deep Learning) ──────────────
  async predict(patientData) {
    const res = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(patientData),
    });
    return handleResponse(res);
  },

  // ── Recommendation (Reinforcement Learning) ─
  async recommend(disease) {
    const res = await fetch(`${API_URL}/recommend`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ disease }),
    });
    return handleResponse(res);
  },

  // ── Feedback (RL Reward Signal) ─────────────
  async submitFeedback(feedbackData) {
    const res = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feedbackData),
    });
    return handleResponse(res);
  },

  // ── Analytics ───────────────────────────────
  async getStats() {
    const res = await fetch(`${API_URL}/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

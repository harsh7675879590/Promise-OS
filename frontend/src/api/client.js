/**
 * PromiseOS — API Client Service
 * Interacts with FastAPI backend endpoints on http://localhost:8000
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Conversations
  listConversations: () => request('/conversations'),
  createConversation: (title, source_type = 'whatsapp') =>
    request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, source_type })
    }),

  // Ingest chat text & trigger LangGraph
  ingest: (conversation_id, raw_text) =>
    request('/ingest', {
      method: 'POST',
      body: JSON.stringify({ conversation_id, raw_text })
    }),

  // Commitments
  listCommitments: (conversation_id) =>
    request(`/commitments${conversation_id ? `?conversation_id=${conversation_id}` : ''}`),
  getCommitment: (id) => request(`/commitments/${id}`),

  // Graph
  getGraph: (conversation_id) => request(`/graph/${conversation_id}`),

  // Risks & Evidence
  listRisks: (conversation_id, min_level) => {
    const params = new URLSearchParams();
    if (conversation_id) params.append('conversation_id', conversation_id);
    if (min_level) params.append('min_level', min_level);
    const qs = params.toString();
    return request(`/risks${qs ? `?${qs}` : ''}`);
  },

  // What-If Simulation
  simulateWhatIf: (commitment_id, scenario = 'delayed') =>
    request('/what-if', {
      method: 'POST',
      body: JSON.stringify({ commitment_id, scenario })
    }),

  // Human Approval (safeguarded)
  approveRecommendation: (recommendation_id, user_id = 'demo_user') =>
    request(`/recommendations/${recommendation_id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ user_id })
    }),

  dismissRecommendation: (recommendation_id, user_id = 'demo_user') =>
    request(`/recommendations/${recommendation_id}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ user_id })
    }),

  // AMD ROCm vs CPU Benchmark
  getBenchmark: () => request('/benchmark'),
  runBenchmark: (batch_size = 50) =>
    request(`/benchmark/run?batch_size=${batch_size}`, {
      method: 'POST'
    })
};

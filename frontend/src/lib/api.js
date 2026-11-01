import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Cached CSRF fetch — called at most once per app lifecycle, or after a 419.
let csrfPromise = null;

export function ensureCsrf() {
  if (!csrfPromise) {
    csrfPromise = axios
      .get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true })
      .catch((err) => {
        csrfPromise = null; // allow retry
        throw err;
      });
  }
  return csrfPromise;
}

// Before every mutating request: ensure CSRF cookie is present.
api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();

  // Let the browser set the correct Content-Type for FormData (with boundary).
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    try {
      await ensureCsrf();
    } catch {
      // backend will still validate; don't block
    }
  }
  return config;
});
// Retry once on 419 (expired CSRF), then reject.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error?.config;
    if (error?.response?.status === 419 && cfg && !cfg.__csrfRetried) {
      csrfPromise = null; // force refetch
      await ensureCsrf().catch(() => {});
      cfg.__csrfRetried = true;
      return api.request(cfg);
    }
    return Promise.reject(error);
  }
);
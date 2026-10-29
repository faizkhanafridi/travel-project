
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const BACKEND_URL = new URL(API_BASE_URL).origin;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 20000,
});

let csrfReady = false;
let csrfPromise = null;

export const ensureCsrf = async () => {
  if (csrfReady) return;
  if (csrfPromise) return csrfPromise;

  csrfPromise = axios
    .get(`${BACKEND_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
      withXSRFToken: true,
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then(() => {
      csrfReady = true;
    })
    .finally(() => {
      csrfPromise = null;
    });

  try {
    await csrfPromise;
  } catch (error) {
    csrfReady = false;
    throw error;
  }
};

axiosInstance.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();

  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    await ensureCsrf();
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error?.response?.data || {};

    return Promise.reject({
      status: error?.response?.status,
      message: payload?.message || 'Something went wrong. Please try again.',
      errors: payload?.errors || null,
      success: payload?.success ?? false,
    });
  }
);

export default axiosInstance;

import axios from "axios";

const API_URL = "http://localhost:3003/api";

// Shared axios instance used across all services
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor — automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- 401 interceptor wiring ----
// The AuthContext will call setupInterceptors(logoutFn) once it mounts,
// giving us a reference to the context-aware logout function.
let _logoutCallback = null;
let _interceptorId = null;

export const setupInterceptors = (logoutCallback) => {
  _logoutCallback = logoutCallback;

  // Remove previous interceptor if re-registering (e.g. StrictMode double mount)
  if (_interceptorId !== null) {
    api.interceptors.response.eject(_interceptorId);
  }

  _interceptorId = api.interceptors.response.use(
    (response) => response, // pass through successful responses
    (error) => {
      if (error.response?.status === 401 && _logoutCallback) {
        // Token expired or invalid — force logout
        console.warn("Received 401 — session expired, logging out.");
        _logoutCallback();
      }
      return Promise.reject(error);
    },
  );
};

export default api;

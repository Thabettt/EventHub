import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Shared axios instance used across all services
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send HttpOnly cookies with every request
});

// Note: No request interceptor needed for token — the HttpOnly cookie
// is sent automatically by the browser with withCredentials: true.

// ---- Silent refresh + 401 interceptor wiring ----
// The AuthContext will call setupInterceptors(logoutFn) once it mounts,
// giving us a reference to the context-aware logout function.
let _logoutCallback = null;
let _interceptorId = null;
let _isRefreshing = false;
let _failedQueue = [];

// Process queued requests after a refresh attempt
const processQueue = (error) => {
  _failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  _failedQueue = [];
};

export const setupInterceptors = (logoutCallback) => {
  _logoutCallback = logoutCallback;

  // Remove previous interceptor if re-registering (e.g. StrictMode double mount)
  if (_interceptorId !== null) {
    api.interceptors.response.eject(_interceptorId);
  }

  _interceptorId = api.interceptors.response.use(
    (response) => response, // pass through successful responses
    async (error) => {
      const originalRequest = error.config;

      // Only attempt refresh on 401, and not for auth endpoints themselves
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/refresh") &&
        !originalRequest.url?.includes("/auth/login") &&
        !originalRequest.url?.includes("/auth/register")
      ) {
        // If already refreshing, queue this request
        if (_isRefreshing) {
          return new Promise((resolve, reject) => {
            _failedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }

        originalRequest._retry = true;
        _isRefreshing = true;

        try {
          // Attempt silent refresh
          await axios.post(`${API_URL}/auth/refresh`, null, {
            withCredentials: true,
          });

          // Refresh succeeded — new access token cookie is set
          processQueue(null);
          return api(originalRequest); // retry original request
        } catch (refreshError) {
          // Refresh failed — session is truly expired
          processQueue(refreshError);
          if (_logoutCallback) {
            console.warn("Session expired — logging out.");
            _logoutCallback();
          }
          return Promise.reject(refreshError);
        } finally {
          _isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

export default api;

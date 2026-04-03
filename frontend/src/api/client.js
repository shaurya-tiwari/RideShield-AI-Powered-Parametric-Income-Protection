import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.config || error.config._skipInterceptors) {
      return Promise.reject(error);
    }
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    if (status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/auth") {
        window.location.href = "/auth?reason=session_expired";
      }
    } else if (status === 403) {
      toast.error(detail || "You do not have permission for this action.");
    } else if (status === 429) {
      toast.error("Too many requests. Please wait a moment and try again.");
    } else if (status >= 500) {
      toast.error("A server error occurred. Please try again later.");
    }
    return Promise.reject(error);
  },
);

export default client;

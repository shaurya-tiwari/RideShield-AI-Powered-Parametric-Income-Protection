import axios from "axios";
import { evaluateError } from "./errorStrategy";

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

// In-flight tracking to prevent duplicating identical concurrent requests
const activeRequests = new Map();

// Lightweight Adaptive Intelligence Cache
const getCache = new Map();
const CACHE_TTL = 3 * 60 * 1000;

function isFinancialRoute(url) {
  if (!url) return false;
  return url.includes("/claims") || url.includes("/payouts");
}

function getCacheKey(config) {
  const url = [config.baseURL, config.url].filter(Boolean).join("").replace(/\/+/g, "/");
  return `${config.method?.toUpperCase()}:${url}:${JSON.stringify(config.params || {})}`;
}

client.interceptors.request.use((config) => {
  if (config.method?.toUpperCase() === "GET") {
    if (!isFinancialRoute(config.url)) {
      const key = getCacheKey(config);
      const entry = getCache.get(key);
      if (entry && Date.now() < entry.expiry) {
        config.adapter = () => Promise.resolve(entry.response);
      } else if (entry) {
        getCache.delete(key);
      }
    }
  } else {
    const key = `${config.method}:${config.url}`;
    if (activeRequests.has(key)) {
       // Optional: we can throttle or log here. Currently we let axios proceed, 
       // but we track it so retries don't stack violently.
    }
    activeRequests.set(key, true);
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    // Clear tracking on success
    const key = `${response.config.method}:${response.config.url}`;
    activeRequests.delete(key);

    // Save to cache if eligible GET
    if (response.config.method?.toUpperCase() === "GET" && !isFinancialRoute(response.config.url)) {
      const cacheKey = getCacheKey(response.config);
      getCache.set(cacheKey, {
        response,
        expiry: Date.now() + CACHE_TTL
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (originalRequest) {
      const key = `${originalRequest.method}:${originalRequest.url}`;
      activeRequests.delete(key);
    }

    if (!originalRequest || originalRequest._skipInterceptors) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const detailPayload = error.response?.data?.detail;

    // 1. Evaluate the error using the Central Strategy
    const { errorCode, strategy } = evaluateError(status, detailPayload, error);

    // 2. Cancellation Check
    // If the route changed wildly while the request was in flight, abort silent retries to prevent ghost updates.
    if (!originalRequest._routeSnapshot) {
      originalRequest._routeSnapshot = window.location.pathname;
    }
    if (originalRequest._routeSnapshot !== window.location.pathname) {
      // User navigated away. Kill retry loop.
      return Promise.reject(error);
    }

    // 3. Strategy Execution Loop
    if (strategy.action === "redirect") {
      if (window.location.pathname !== "/auth") {
        window.location.href = `/auth?reason=${errorCode}`;
      }
    } else if (strategy.action === "retry" || strategy.action === "silent_retry") {
      const maxAttempts = strategy.retry?.maxAttempts || 1;
      originalRequest._retryCount = originalRequest._retryCount || 0;
      
      if (originalRequest._retryCount < maxAttempts) {
        originalRequest._retryCount++;
        const delay = strategy.retry?.delay || 1000;
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Retry the request
        return client(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default client;

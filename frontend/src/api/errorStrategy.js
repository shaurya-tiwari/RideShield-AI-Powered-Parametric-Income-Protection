import toast from "react-hot-toast";
import i18n from "../i18n/config";
import { logError } from "../utils/logger";

// --- GLOBAL SYSTEM STATE ---
export const SYSTEM_STATE = {
  offline: !navigator.onLine,
  degraded: false,
  rateLimited: false,
};

window.addEventListener("offline", () => { SYSTEM_STATE.offline = true; });
window.addEventListener("online", () => { SYSTEM_STATE.offline = false; });

// --- CONFIGURATION MATRIX ---
export const ERROR_STRATEGIES = {
  // Auth Flows
  "AUTH_EXPIRED": { action: "redirect", ui: "toast", severity: "high" },
  "AUTH_INVALID_TOKEN": { action: "redirect", ui: "toast", severity: "high" },
  "AUTH_REQUIRED": { action: "redirect", ui: "silent", severity: "medium" },
  "AUTH_INVALID_CREDENTIALS": { action: "none", ui: "toast", severity: "medium" },
  "AUTH_ACCOUNT_INACTIVE": { action: "none", ui: "toast", severity: "high" },
  
  // Rate Limiting
  "RATE_LIMIT_EXCEEDED": {
    action: "halt",
    retry: { delay: 3000, maxAttempts: 1 },
    ui: "toast",
    severity: "medium"
  },

  // Location/Validation
  "LOCATION_CITY_NOT_SUPPORTED": { action: "none", ui: "inline", severity: "medium" },
  "LOCATION_ZONE_NOT_SUPPORTED": { action: "none", ui: "inline", severity: "medium" },
  "VALIDATION_FAILED": { action: "none", ui: "toast", severity: "low" },
  
  // Financial/Policies (No auto-retry on these to prevent catastrophic loops)
  "POLICY_ALREADY_EXISTS": { action: "none", ui: "toast", severity: "medium" },
  "WORKER_PHONE_EXISTS": { action: "none", ui: "toast", severity: "medium" },

  // Network Level
  "NETWORK_ERROR": {
    action: "retry",
    retry: { delay: 2000, maxAttempts: 3 },
    ui: "silent",
    severity: "high"
  },
  "TIMEOUT": {
    action: "retry",
    retry: { delay: 2000, maxAttempts: 2 },
    ui: "silent",
    severity: "high"
  },
  "SERVER_ERROR": {
    action: "retry",
    retry: { delay: 3000, maxAttempts: 1 },
    ui: "toast",
    severity: "high",
  },

  // Fallback
  "DEFAULT": { action: "none", ui: "toast", severity: "medium" }
};

// --- DEDUPLICATION CACHE ---
const errorCache = new Map();
const DEDUP_WINDOW_MS = 3000;

function isDuplicate(errorCode, route) {
  const key = `${errorCode}-${route}`;
  const now = Date.now();
  if (errorCache.has(key) && (now - errorCache.get(key)) < DEDUP_WINDOW_MS) {
    return true;
  }
  errorCache.set(key, now);
  return false;
}

// --- CORE EVALUATOR ---
export function evaluateError(status, detailPayload, errorObj) {
  const route = window.location.pathname;
  
  // 1. Determine Error Code
  let errorCode = "UNKNOWN_ERROR";
  let fallbackMessage = "An unexpected error occurred.";

  if (typeof detailPayload === "object" && detailPayload !== null) {
      errorCode = detailPayload.error_code || "UNKNOWN_ERROR";
      fallbackMessage = detailPayload.message || "";
  } else if (typeof detailPayload === "string") {
      fallbackMessage = detailPayload;
  }

  // Override mapped errorCode if we have standard HTTP-level overrides
  // Only override if the backend didn't supply an explicit error_code
  if (errorCode === "UNKNOWN_ERROR") {
      if (!errorObj.response) {
          errorCode = errorObj.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK_ERROR";
      } else if (status === 429) {
          errorCode = "RATE_LIMIT_EXCEEDED";
      } else if (status === 401) {
          errorCode = "AUTH_EXPIRED";
      } else if (status === 403) {
          errorCode = "FORBIDDEN";
      } else if (status >= 500) {
          errorCode = "SERVER_ERROR";
      }
  }

  // 2. Fetch Strategy
  const strategy = ERROR_STRATEGIES[errorCode] || ERROR_STRATEGIES["DEFAULT"];

  // 3. Update System State
  if (errorCode === "RATE_LIMIT_EXCEEDED") SYSTEM_STATE.rateLimited = true;
  if (errorCode === "NETWORK_ERROR" || errorCode === "TIMEOUT") SYSTEM_STATE.degraded = true;

  // 4. Deduplication
  const isSpam = isDuplicate(errorCode, route);

  // 5. Observability Hook
  logError({
    code: errorCode,
    route,
    isDuplicate: isSpam,
    severity: strategy.severity
  });

  // 6. Present UI (Only if not duplicate and not marked silent/inline)
  if (!isSpam && strategy.ui === "toast") {
    // If translation is missing, it will use the fallback message
    const translationKey = `errors.${errorCode}`;
    const defaultMsg = fallbackMessage || i18n.t("errors.UNKNOWN_ERROR", "An error occurred.");
    const translatedMsg = i18n.t(translationKey, defaultMsg);
    
    if (strategy.severity === "high") {
       toast.error(translatedMsg, { duration: 5000 });
    } else {
       toast.error(translatedMsg);
    }
  }

  // Return the computed plan so the caller (client.js) can execute network retries or redirects
  return {
    errorCode,
    strategy,
    isDuplicate: isSpam
  };
}

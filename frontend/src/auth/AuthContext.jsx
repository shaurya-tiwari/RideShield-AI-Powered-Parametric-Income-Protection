import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import toast from "react-hot-toast";

import { authApi } from "../api/auth";
import { setAuthToken } from "../api/client";

const SESSION_KEY = "rideshield.session_meta";
const LEGACY_WORKER_ID_KEY = "rideshield.workerId";
const SESSION_TOKEN_KEY = "rideshield.session_token";

function canUseSessionTokenFallback() {
  return typeof window !== "undefined" && window.location.hostname === "localhost";
}

export function sanitizeSessionMeta(meta) {
  const role = meta?.session?.role;
  return role ? { session: { role } } : null;
}

export function readStoredSessionMeta() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? sanitizeSessionMeta(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeStoredSessionMeta(meta) {
  try {
    const sanitized = sanitizeSessionMeta(meta);
    if (!sanitized) {
      clearStoredSessionMeta();
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sanitized));
    localStorage.removeItem(LEGACY_WORKER_ID_KEY);
  } catch {
    // Storage unavailable
  }
}

export function clearStoredSessionMeta() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_WORKER_ID_KEY);
  } catch {
    // Storage unavailable
  }
}

export function readStoredSessionToken() {
  if (!canUseSessionTokenFallback()) {
    return null;
  }

  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeStoredSessionToken(token) {
  setAuthToken(token || null);

  if (!canUseSessionTokenFallback()) {
    return;
  }

  try {
    if (token) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    // Storage unavailable
  }
}

export function clearStoredSessionToken() {
  setAuthToken(null);

  if (!canUseSessionTokenFallback()) {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Storage unavailable
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSessionMeta());
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let active = true;
    const stored = readStoredSessionMeta();
    const storedToken = readStoredSessionToken();
    if (stored) {
      writeStoredSessionMeta(stored);
    } else {
      clearStoredSessionMeta();
    }
    setAuthToken(storedToken);

    async function restore() {
      try {
        const response = await authApi.me();
        if (!active) {
          return;
        }
        const next = { session: response.data.session };
        setSession(next);
        writeStoredSessionMeta(next);
      } catch (error) {
        if (active) {
          setSession(null);
          clearStoredSessionMeta();
          clearStoredSessionToken();
          if (error?.response?.status !== 401) {
            toast.error("Session could not be restored. Please sign in again.");
          }
        }
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    }

    restore();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      booting,
      session,
      isAuthenticated: Boolean(session?.session),
      role: session?.session?.role || null,
      async loginWorker(phone, password) {
        const response = await authApi.workerLogin({ phone, password });
        const next = { session: response.data.session };
        flushSync(() => {
          setSession(next);
        });
        writeStoredSessionMeta(next);
        writeStoredSessionToken(response.data.token);
        return next;
      },
      async loginAdmin(username, password) {
        const response = await authApi.adminLogin({ username, password });
        const next = { session: response.data.session };
        flushSync(() => {
          setSession(next);
        });
        writeStoredSessionMeta(next);
        writeStoredSessionToken(response.data.token);
        return next;
      },
      async logout() {
        try {
          await authApi.logout();
        } catch {
          // cookie cleared by server
        }
        clearStoredSessionMeta();
        clearStoredSessionToken();
        flushSync(() => {
          setSession(null);
        });
      },
    }),
    [booting, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

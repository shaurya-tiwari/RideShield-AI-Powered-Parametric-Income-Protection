import {
  clearStoredSessionToken,
  clearStoredSessionMeta,
  readStoredSessionToken,
  writeStoredSessionToken,
  readStoredSessionMeta,
  writeStoredSessionMeta,
} from "../../src/auth/AuthContext";
import client from "../../src/api/client";

describe("AuthContext session metadata helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    delete client.defaults.headers.common.Authorization;
  });

  it("stores only the role in localStorage", () => {
    writeStoredSessionMeta({
      session: {
        role: "worker",
        worker_id: "worker-123",
        name: "Asha",
        phone: "+919999999999",
      },
    });

    expect(JSON.parse(localStorage.getItem("rideshield.session_meta"))).toEqual({
      session: { role: "worker" },
    });
    expect(readStoredSessionMeta()).toEqual({
      session: { role: "worker" },
    });
  });

  it("clears the legacy onboarding worker id key", () => {
    localStorage.setItem("rideshield.workerId", "worker-123");

    writeStoredSessionMeta({ session: { role: "worker" } });
    expect(localStorage.getItem("rideshield.workerId")).toBeNull();

    localStorage.setItem("rideshield.workerId", "worker-123");
    clearStoredSessionMeta();
    expect(localStorage.getItem("rideshield.workerId")).toBeNull();
  });

  it("stores the session token in sessionStorage and applies the auth header on localhost", () => {
    writeStoredSessionToken("dev-token");

    expect(readStoredSessionToken()).toBe("dev-token");
    expect(sessionStorage.getItem("rideshield.session_token")).toBe("dev-token");
    expect(client.defaults.headers.common.Authorization).toBe("Bearer dev-token");

    clearStoredSessionToken();

    expect(readStoredSessionToken()).toBeNull();
    expect(sessionStorage.getItem("rideshield.session_token")).toBeNull();
    expect(client.defaults.headers.common.Authorization).toBeUndefined();
  });
});

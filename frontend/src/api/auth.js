import client from "./client";

export const authApi = {
  workerLogin: (payload) => client.post("/api/auth/worker/login", payload),
  adminLogin: (payload) => client.post("/api/auth/admin/login", payload),
  me: () => client.get("/api/auth/me", { _skipInterceptors: true }),
  logout: () => client.post("/api/auth/logout", null, { _skipInterceptors: true }),
};

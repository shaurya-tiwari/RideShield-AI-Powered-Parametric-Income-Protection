import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("../../src/auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithAuth(authValue) {
  mockUseAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <div data-testid="protected-content">Protected</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div data-testid="login-page">Login</div>} />
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("shows booting state while session is loading", () => {
    renderWithAuth({ booting: true, isAuthenticated: false, role: null, session: null });
    expect(screen.getByText(/Restoring session/i)).toBeInTheDocument();
  });

  it("redirects to /auth when unauthenticated", () => {
    renderWithAuth({ booting: false, isAuthenticated: false, role: null, session: null });
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("shows protected content when authenticated with correct role", () => {
    renderWithAuth({
      booting: false,
      isAuthenticated: true,
      role: "admin",
      session: { session: { role: "admin" } },
    });
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("redirects to home when authenticated but wrong role", () => {
    renderWithAuth({
      booting: false,
      isAuthenticated: true,
      role: "worker",
      session: { session: { role: "worker" } },
    });
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });
});

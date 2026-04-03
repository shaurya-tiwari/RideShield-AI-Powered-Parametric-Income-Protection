import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../auth/AuthContext";
import SectionHeader from "../components/SectionHeader";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWorker, loginAdmin } = useAuth();
  const [tab, setTab] = useState("worker");
  const [loading, setLoading] = useState(false);
  const [workerPhone, setWorkerPhone] = useState("");
  const [workerPassword, setWorkerPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const redirectTarget = location.state?.from?.pathname;

  useEffect(() => {
    document.title = "Sign In | RideShield";
  }, []);

  async function handleWorkerLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await loginWorker(workerPhone, workerPassword);
      navigate(redirectTarget || `/dashboard/${result.session.worker_id}`, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Worker sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await loginAdmin(adminUsername, adminPassword);
      navigate(redirectTarget || "/admin", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Admin sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="context-panel p-8">
        <SectionHeader
          eyebrow="Access"
          title="Sign in to RideShield"
          description="Worker and admin sessions are separate so protection flows and operational controls stay clean."
        />

        <div className="mb-6 flex gap-2 rounded-2xl bg-surface-container-high p-1">
          <button
            type="button"
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${tab === "worker" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:bg-surface-container-highest"}`}
            onClick={() => setTab("worker")}
          >
            Worker sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${tab === "admin" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:bg-surface-container-highest"}`}
            onClick={() => setTab("admin")}
          >
            Admin sign in
          </button>
        </div>

        {tab === "worker" ? (
          <form className="space-y-5" onSubmit={handleWorkerLogin}>
            <div>
              <label className="label">Registered phone number</label>
              <input className="field" value={workerPhone} onChange={(e) => setWorkerPhone(e.target.value)} placeholder="+919876543210" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="field"
                type="password"
                value={workerPassword}
                onChange={(e) => setWorkerPassword(e.target.value)}
                placeholder="Enter worker password"
                required
              />
            </div>
            <button type="submit" className="button-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Continue as worker"}
            </button>
            <p className="text-sm text-on-surface-variant">
              New here? <Link to="/onboarding" className="font-semibold text-secondary">Create a worker profile</Link>
            </p>
            <div className="rounded-[20px] bg-surface-container-low p-4 text-sm leading-7 text-on-surface-variant">
              After login, workers land on their decision surface: current protection, current claim, why a payout was
              approved or delayed, and recent payout history.
            </div>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleAdminLogin}>
            <div>
              <label className="label">Admin username</label>
              <input className="field" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="Enter admin username" required />
            </div>
            <div>
              <label className="label">Admin password</label>
              <input className="field" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Enter admin password" required />
            </div>
            <button type="submit" className="button-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Continue as admin"}
            </button>
            <div className="rounded-[20px] bg-surface-container-low p-4 text-sm leading-7 text-on-surface-variant">
              After login, admins land on the operational control surface: review queue, incident pressure, scheduler
              state, and demo scenario controls.
            </div>
          </form>
        )}
      </div>

      <div className="context-panel p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">Why RideShield</p>
        <h2 className="mt-2 text-3xl font-bold text-primary">Income protection that feels automatic, not bureaucratic.</h2>
        <div className="mt-6 space-y-4 text-sm text-on-surface-variant">
          <p>Workers do not file claims manually. RideShield monitors zone-level disruptions, matches active policies, and pays automatically when confidence is high.</p>
          <p>Admins see the pressure points behind the engine: delayed reviews, duplicate prevention, payout movement, and scheduler status.</p>
          <p>The product is built to explain outcomes clearly so approved, delayed, and rejected claims never feel arbitrary.</p>
        </div>
      </div>
    </div>
  );
}

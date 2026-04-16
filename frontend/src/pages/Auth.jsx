import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { workersApi } from "../api/workers";
import { policiesApi } from "../api/policies";
import { useTranslation } from "react-i18next";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");
  const { loginWorker, loginAdmin } = useAuth();
  const [tab, setTab] = useState("worker");
  const [loading, setLoading] = useState(false);
  const [workerPhone, setWorkerPhone] = useState("");
  const [workerPassword, setWorkerPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const redirectTarget = location.state?.from?.pathname;

  useEffect(() => { document.title = "Sign In | RideShield"; }, []);

  async function handleWorkerLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await loginWorker(workerPhone, workerPassword);
      const wid = result.session.worker_id;
      if (!redirectTarget || redirectTarget.includes("dashboard")) {
        try { workersApi.profile(wid); policiesApi.active(wid); } catch { /* preload only */ }
      }
      navigate(redirectTarget || `/dashboard/${wid}`, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Worker sign-in failed.");
    } finally { setLoading(false); }
  }

  async function handleAdminLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await loginAdmin(adminUsername, adminPassword);
      navigate(redirectTarget || "/admin", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Admin sign-in failed.");
    } finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex items-center justify-center -mt-6">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-[var(--rs-accent)] opacity-20 blur-[100px] animate-float"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-[var(--rs-surface)] opacity-[0.25] blur-[120px] animate-glow-pulse" style={{ animationDelay: "1.5s" }}></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[var(--rs-accent)] opacity-10 blur-[150px] animate-float" style={{ animationDelay: "3s" }}></div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_1fr] relative z-10 w-full px-4 sm:px-6 lg:px-8">

      {/* ── Left: Form panel ────────────────────────── */}
      {/* Light: solid white surface, crisp border, soft shadow
          Dark: dark surface with subtle inner border */}
      <div className="panel p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="eyebrow mb-2">{t("auth.eyebrow", { defaultValue: "Access" })}</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--rs-text-primary)" }}>
            {t("auth.title", { defaultValue: "Sign in to RideShield" })}
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--rs-text-secondary)" }}>
            {t("auth.subtitle", { defaultValue: "Worker and admin sessions are separate for clean protection flows." })}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex gap-1.5 rounded-xl p-1.5" style={{ background: "var(--rs-elevated)", border: "1px solid var(--rs-border)" }}>
          {["worker", "admin"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setTab(role)}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 capitalize"
              style={tab === role
                ? { background: "var(--rs-accent)", color: "var(--rs-on-accent)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }
                : { color: "var(--rs-text-secondary)", background: "transparent" }
              }
            >
              {role} sign in
            </button>
          ))}
        </div>

        {tab === "worker" ? (
          <form className="space-y-4" onSubmit={handleWorkerLogin}>
            <div>
              <label className="label">{t("auth.worker.phone_label", { defaultValue: "Registered phone number" })}</label>
              <input
                className="field"
                value={workerPhone}
                onChange={(e) => setWorkerPhone(e.target.value)}
                placeholder="+919876543210"
                required
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="label">{t("auth.worker.password_label", { defaultValue: "Password" })}</label>
              <input
                className="field"
                type="password"
                value={workerPassword}
                onChange={(e) => setWorkerPassword(e.target.value)}
                placeholder={t("auth.worker.password_placeholder", { defaultValue: "Enter worker password" })}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="button-primary w-full py-3 text-[14px]" disabled={loading}>
              {loading ? t("auth.signing_in", { defaultValue: "Signing in..." }) : t("auth.worker.cta", { defaultValue: "Continue as worker" })}
            </button>
            <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>
              {t("auth.worker.no_account", { defaultValue: "New here?" })}{" "}
              <Link to="/onboarding" className="font-semibold" style={{ color: "var(--rs-accent)" }}>
                {t("auth.worker.register_link", { defaultValue: "Create a worker profile" })}
              </Link>
            </p>
            {/* Info hint */}
            <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "var(--rs-elevated)", border: "1px solid var(--rs-border)", color: "var(--rs-text-secondary)" }}>
              {t("auth.worker.info_hint", { defaultValue: "After login, workers see their active protection, claim status, and payout history." })}
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleAdminLogin}>
            <div>
              <label className="label">{t("auth.admin.username_label", { defaultValue: "Admin username" })}</label>
              <input
                className="field"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder={t("auth.admin.username_placeholder", { defaultValue: "Enter admin username" })}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label">{t("auth.admin.password_label", { defaultValue: "Admin password" })}</label>
              <input
                className="field"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={t("auth.admin.password_placeholder", { defaultValue: "Enter admin password" })}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="button-primary w-full py-3 text-[14px]" disabled={loading}>
              {loading ? t("auth.signing_in", { defaultValue: "Signing in..." }) : t("auth.admin.cta", { defaultValue: "Continue as admin" })}
            </button>
            <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "var(--rs-elevated)", border: "1px solid var(--rs-border)", color: "var(--rs-text-secondary)" }}>
              {t("auth.admin.info_hint", { defaultValue: "Admins access the operational control surface: review queue, incident pressure, and demo controls." })}
            </div>
          </form>
        )}
      </div>

      {/* ── Right: Why RideShield context panel ────── */}
      {/* Light: solid white + accent left border
          Dark: dark surface, glow */}
      <div className="panel p-8 flex flex-col" style={{ borderLeft: "3px solid var(--rs-accent)" }}>
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={20} style={{ color: "var(--rs-accent)" }} />
          <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--rs-accent)" }}>
            {t("auth.sidebar.label", { defaultValue: "Why RideShield" })}
          </p>
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-snug" style={{ color: "var(--rs-text-primary)" }}>
          {t("auth.sidebar.headline", { defaultValue: "Income protection that feels automatic, not bureaucratic." })}
        </h2>
        <div className="mt-6 space-y-5 text-sm leading-relaxed flex-1" style={{ color: "var(--rs-text-secondary)" }}>
          <p>{t("auth.sidebar.p1", { defaultValue: "Workers do not file claims manually. RideShield monitors zone-level disruptions, matches active policies, and pays automatically when confidence is high." })}</p>
          <p>{t("auth.sidebar.p2", { defaultValue: "Admins see the pressure points behind the engine: delayed reviews, duplicate prevention, payout movement, and scheduler status." })}</p>
          <p>{t("auth.sidebar.p3", { defaultValue: "The product is built to explain outcomes clearly so approved, delayed, and rejected claims never feel arbitrary." })}</p>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 pt-6 grid grid-cols-3 gap-4" style={{ borderTop: "1px solid var(--rs-border)" }}>
          {[
            { value: t("auth.sidebar.stats.accuracy_value", { defaultValue: "98.4%" }), label: t("auth.sidebar.stats.accuracy_label", { defaultValue: "Payout accuracy" }) },
            { value: t("auth.sidebar.stats.resolution_value", { defaultValue: "< 24h" }), label: t("auth.sidebar.stats.resolution_label", { defaultValue: "Resolution time" }) },
            { value: t("auth.sidebar.stats.manual_value", { defaultValue: "₹0" }), label: t("auth.sidebar.stats.manual_label", { defaultValue: "Manual claims" }) },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-black" style={{ color: "var(--rs-accent)" }}>{value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide mt-0.5" style={{ color: "var(--rs-text-secondary)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

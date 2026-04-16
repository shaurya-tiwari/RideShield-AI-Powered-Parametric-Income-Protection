import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, BrainCircuit, LayoutDashboard, LogOut, PlaySquare, Settings, Shield, ShieldCheck, Siren, Sparkles, FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

const workerNav = [
  { to: "/dashboard", labelKey: "dashboard.title", icon: LayoutDashboard },
];

const adminNav = [
  { to: "/admin", labelKey: "appFrame.admin_panel", icon: ShieldCheck, defaultLabel: "Admin Panel" },
  { to: "/demo", labelKey: "appFrame.demo_runner", icon: PlaySquare, defaultLabel: "Demo Runner" },
  { to: "/lab", labelKey: "appFrame.scenario_lab", icon: FlaskConical, defaultLabel: "Scenario Lab" },
  { to: "/intelligence", labelKey: "appFrame.intelligence", icon: BrainCircuit, defaultLabel: "Intelligence" },
];

export default function AppFrame({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, role, logout } = useAuth();
  const { t } = useTranslation();

  const navItems = role === "admin" ? adminNav : workerNav;
  const title =
    location.pathname.startsWith("/demo")
      ? "Simulation Control"
      : location.pathname.startsWith("/lab")
        ? "Scenario Lab"
        : location.pathname.startsWith("/intelligence")
          ? "System Intelligence"
          : location.pathname.startsWith("/admin")
            ? "System Oversight"
            : t("dashboard.title");

  const userLabel = session?.session?.name || session?.session?.username || "RideShield user";
  const initials = useMemo(
    () =>
      userLabel
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "RS",
    [userLabel],
  );

  async function handleLogout() {
    await logout();
    navigate("/auth");
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col glass-light dark:glass-dark backdrop-blur-2xl lg:flex bg-white/20 dark:bg-black/20" style={{ borderRight: "1px solid rgba(255, 255, 255, 0.2)", border: "none" }}>
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-cta-gradient text-on-primary shadow-md shadow-primary/20 ring-1 ring-white/20 dark:ring-primary/20">
              <span className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-br from-white/20 to-transparent opacity-50" aria-hidden />
              <Shield className="relative" size={18} strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 font-display">
              <div className="flex items-baseline gap-0 tracking-[-0.03em]">
                <span className="text-base font-extrabold text-on-surface">Ride</span>
                <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-400 bg-clip-text text-base font-extrabold text-transparent dark:from-primary dark:via-emerald-300 dark:to-teal-300">
                  Shield
                </span>
              </div>
              <p className="mt-0.5 truncate text-[0.6rem] font-medium uppercase tracking-[0.28em] text-on-surface-variant">
                Parametric protection
              </p>
            </div>
          </div>

          <button type="button" className="button-primary mb-6 w-full justify-start rounded-[22px] px-4 py-3" onClick={() => toast("Live oversight mode is active.", { icon: "✨" })}>
            <Sparkles size={16} />
            {role === "admin" ? "Review live incidents" : t("appFrame.view_active_protection")}
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-surface-container text-primary shadow-ambient-glow" : "text-on-surface-variant hover:bg-surface-container-low"
                  }`
                }
              >
                <item.icon size={17} />
                <span>{item.labelKey ? t(item.labelKey, { defaultValue: item.defaultLabel || item.label }) : item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2 border-t border-white/10 pt-6">
            <div className="rounded-[24px] bg-surface-container p-4" style={{ border: "1px solid rgba(69, 70, 79, 0.15)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-primary">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{userLabel}</p>
                  <p className="text-xs text-on-surface-variant">{role === "admin" ? "Operations session" : t("appFrame.protected_worker_session")}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: "#69f8e9" }}>
                <Sparkles size={15} />
                <span>{role === "admin" ? "Live oversight enabled" : t("appFrame.automatic_protection_active")}</span>
              </div>
            </div>

            <button type="button" className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low" onClick={handleLogout}>
              <LogOut size={16} />
              {t("appFrame.sign_out")}
            </button>
            <button type="button" onClick={() => toast(t("appFrame.settings_toast"), { icon: "⚙️" })} className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low">
              <Settings size={16} />
              {t("appFrame.settings")}
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 glass-light dark:glass-dark backdrop-blur-3xl bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-white/10" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", border: "none" }}>
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{title}</p>
                <p className="text-sm font-bold text-primary">
                  {role === "admin" ? "Operational control surface" : t("dashboard.subtitle")}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <div className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant">
                {role === "admin" ? "Operational review mode" : t("appFrame.worker_coverage_mode")}
              </div>
              <button type="button" onClick={() => toast.success(t("appFrame.alert_success"))} className="inline-flex items-center gap-2 rounded-full bg-tertiary-container dark:bg-error/20 px-4 py-2 text-sm font-semibold text-on-tertiary-container dark:text-error transition hover:brightness-110" aria-label="Emergency alert">
                <Siren size={16} />
                {t("appFrame.alert")}
              </button>
              <button type="button" onClick={() => toast("You have no new notifications", { icon: "🔔" })} aria-label="Notifications" className="rounded-full bg-surface-container-high p-3 text-on-surface-variant transition hover:bg-surface-container-highest">
                <Bell size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">{children}</div>
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 z-40 glass-light dark:glass-dark backdrop-blur-3xl px-4 py-3 bg-white/30 dark:bg-black/30 lg:hidden ${navItems.length <= 1 ? "hidden" : ""}`} style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", border: "none" }}>
        <div className="mx-auto flex max-w-xl items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-semibold ${isActive ? "text-primary" : "text-on-surface-variant"}`
              }
            >
              <item.icon size={18} />
              <span>{item.labelKey ? t(item.labelKey, { defaultValue: item.defaultLabel || item.label }) : item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BrainCircuit, FlaskConical, LayoutDashboard, LogOut, Menu, PlaySquare, Settings, ShieldCheck, Siren, Sparkles, X } from "lucide-react";
import NotificationBell from "./NotificationBell";

import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const workerNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const adminNav = [
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
  { to: "/demo", label: "Demo Runner", icon: PlaySquare },
  { to: "/lab", label: "Scenario Lab", icon: FlaskConical },
  { to: "/intelligence", label: "Intelligence", icon: BrainCircuit },
];

export default function AppFrame({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, role, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    }

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  function handleToggleLang() {
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");
  }

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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-surface-container-lowest lg:flex" style={{ borderRight: "1px solid rgba(69, 70, 79, 0.15)" }}>
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[16px] bg-white shadow-sm">
              <img src="/logo.png" alt="RideShield AI logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">RideShield</p>
              <p className="text-base font-bold text-primary whitespace-nowrap">Parametric protection</p>
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
                  `flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-surface-container text-primary shadow-ambient-glow" : "text-on-surface-variant hover:bg-surface-container-low"
                  }`
                }
              >
                <item.icon size={17} />
                <span>{item.label}</span>
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
        <header className="sticky top-0 z-30 bg-surface-container-lowest/85 backdrop-blur-xl" style={{ borderBottom: "1px solid rgba(69, 70, 79, 0.15)" }}>
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
              <button type="button" onClick={() => toast.success(t("appFrame.alert_success"))} className="inline-flex items-center gap-2 rounded-full bg-tertiary-container px-4 py-2 text-sm font-semibold text-on-tertiary-container transition hover:brightness-110" aria-label="Emergency alert">
                <Siren size={16} />
                {t("appFrame.alert")}
              </button>
              <NotificationBell />
              {role !== "admin" && (
                <button
                  type="button"
                  onClick={handleToggleLang}
                  className="rounded-full bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-surface-container-highest"
                  title="Switch language"
                >
                  {t("general.lang_toggle")}
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Overlay Backdrop */}
          <div 
            className={`fixed inset-0 top-16 z-20 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
              isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu Dropdown */}
          <div 
            className={`absolute left-0 right-0 top-16 z-30 border-b border-t border-white/10 bg-surface-container-lowest px-4 py-5 shadow-2xl transition-all duration-300 ease-out md:hidden flex flex-col gap-5 ${
              isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="rounded-full bg-surface-container-high px-4 py-2.5 text-sm font-medium text-center text-on-surface-variant ring-1 ring-white/5 shadow-inner">
              {role === "admin" ? "Operational review mode" : t("appFrame.worker_coverage_mode")}
            </div>
            <button 
              type="button" 
              onClick={() => {
                toast.success(t("appFrame.alert_success"));
                setIsMobileMenuOpen(false);
              }} 
              className="flex w-full items-center justify-center gap-2 rounded-full bg-tertiary-container px-4 py-3.5 text-sm font-semibold text-on-tertiary-container transition hover:brightness-110 shadow-md"
            >
              <Siren size={18} />
              {t("appFrame.alert")}
            </button>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
              <NotificationBell />
              {role !== "admin" && (
                <button
                  type="button"
                  onClick={() => {
                    handleToggleLang();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 rounded-full bg-surface-container-high px-6 py-3 text-sm font-bold text-on-surface-variant transition hover:bg-surface-container-highest ring-1 ring-white/5"
                >
                  {t("general.lang_toggle")}
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">{children}</div>
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur-xl lg:hidden ${navItems.length <= 1 ? "hidden" : ""}`} style={{ borderTop: "1px solid rgba(69, 70, 79, 0.15)" }}>
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
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

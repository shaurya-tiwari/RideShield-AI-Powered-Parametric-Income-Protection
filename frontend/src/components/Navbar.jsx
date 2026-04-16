import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Shield, X, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../auth/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ session }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/auth");
  }

  function handleToggleLang() {
    if (i18n && typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");
    }
  }

  const navItems =
    session?.role === "admin"
      ? [
        { to: "/intelligence", label: t("appFrame.intelligence", { defaultValue: "Intelligence" }) },
        { to: "/demo",         label: t("appFrame.demo_runner",   { defaultValue: "Demo Runner" }) },
        { to: "/lab",          label: t("appFrame.scenario_lab",  { defaultValue: "Scenario Lab" }) },
        { to: "/admin",        label: t("appFrame.admin_panel",   { defaultValue: "Admin" }) },
      ]
      : [
        { to: "/how-it-works", label: t("nav.how_it_works", { defaultValue: "How It Works" }) },
        { to: "/onboarding",   label: t("nav.onboarding", { defaultValue: "Onboarding" }) },
        ...(session?.role === "worker"
          ? [{ to: "/dashboard", label: t("dashboard.title", { defaultValue: "Dashboard" }) }]
          : []),
      ];

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
      isActive ? "active-nav-link" : "inactive-nav-link"
    }`;

  return (
    <header className="sticky top-0 z-20 mb-8 pt-4">
      {/* Main bar — solid light / glass dark */}
      <div
        className="flex h-16 items-center justify-between rounded-xl px-5 glass-strip"
      >
        {/* Brand */}
        <Link to="/" className="flex items-center shrink-0 group">
          <img src="/logo.png" alt="RideShield Logo" className="h-[52px] w-auto object-contain transition-transform duration-200 group-hover:scale-105" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Language toggle */}
          <button
            type="button"
            onClick={handleToggleLang}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200"
            style={{ background: "var(--rs-elevated)", border: "1px solid var(--rs-border)", color: "var(--rs-text-secondary)" }}
            title="Switch language"
          >
            <Languages size={14} />
          </button>

          <ThemeToggle />

          {session && (
            <>
              <div className="mx-1 h-4 w-px" style={{ background: "var(--rs-border)" }} />
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: "var(--rs-elevated)", border: "1px solid var(--rs-border)", color: "var(--rs-text-secondary)" }}
              >
                {session.role} · {session.name ?? session.username}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200"
                style={{ color: "var(--rs-text-secondary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--rs-elevated)"; e.currentTarget.style.color = "var(--rs-text-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--rs-text-secondary)"; }}
              >
                <LogOut size={13} />
                {t("appFrame.sign_out")}
              </button>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={handleToggleLang}
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--rs-elevated)", border: "1px solid var(--rs-border)", color: "var(--rs-text-secondary)" }}
          >
            <Languages size={14} />
          </button>
          <ThemeToggle />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
            style={{ background: "var(--rs-elevated)", border: "1px solid var(--rs-border)", color: "var(--rs-text-secondary)" }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="mt-1 rounded-xl p-2 md:hidden"
          style={{ background: "var(--rs-surface)", border: "1px solid var(--rs-border)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={navLinkClass}
              style={{ display: "block" }}
            >
              {item.label}
            </NavLink>
          ))}
          {session && (
            <div className="mt-1 pt-1" style={{ borderTop: "1px solid var(--rs-border)" }}>
              <div className="px-3 py-2 text-xs" style={{ color: "var(--rs-text-secondary)" }}>
                {session.role} · {session.name ?? session.username}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                style={{ color: "var(--rs-text-secondary)" }}
              >
                <LogOut size={14} />
                {t("appFrame.sign_out")}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Radar, ShieldCheck, Wallet,
  TrendingUp, Clock, Users, CheckCircle2,
  Activity, ChevronRight, Shield, MapPin, Clock3, CalendarDays
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import TiltWrapper from "../components/TiltWrapper";
import GlobalCursorGlow from "../components/GlobalCursorGlow";

/* ─── Data ─────────────────────────────────────────── */

const getStats = (t) => [
  { value: "98.4%", label: t("home.stats.payout_accuracy"),     icon: TrendingUp },
  { value: "< 24h", label: t("home.stats.incident_resolution"), icon: Clock },
  { value: "2,400+", label: t("home.stats.workers_protected"),  icon: Users },
  { value: "₹0",    label: t("home.stats.claims_filed"),        icon: CheckCircle2 },
];

const getWorkerFlow = (t) => [
  { step: "01", icon: MapPin,      title: t("howItWorks.workerFlow.step1_title"), body: t("howItWorks.workerFlow.step1_body") },
  { step: "02", icon: Clock3,      title: t("howItWorks.workerFlow.step2_title"), body: t("howItWorks.workerFlow.step2_body") },
  { step: "03", icon: Radar,       title: t("howItWorks.workerFlow.step3_title"), body: t("howItWorks.workerFlow.step3_body") },
  { step: "04", icon: Activity,    title: t("howItWorks.workerFlow.step4_title"), body: t("howItWorks.workerFlow.step4_body") },
  { step: "05", icon: Wallet,      title: t("howItWorks.workerFlow.step5_title"), body: t("howItWorks.workerFlow.step5_body") },
];

/* ─── Hooks ─────────────────────────────────────────── */

function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
}

function use3DTilt(intensity = 10) {
  const ref = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rotateX = ((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * -intensity;
    const rotateY = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * intensity;
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01,1.01,1.01)`;
  }, [intensity]);
  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)";
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => { el.removeEventListener("mousemove", handleMouseMove); el.removeEventListener("mouseleave", handleMouseLeave); };
  }, [handleMouseMove, handleMouseLeave]);
  return ref;
}

/* ─── Sub-components ────────────────────────────────── */

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState("0");
  const [revealed, setRevealed] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setDisplay(value); setRevealed(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref} className={revealed ? "counter-pop inline-block" : "inline-block"}>{display}</span>;
}

/* Subtle premium blue ambient glow in hero */
function FloatingOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="orb-1 morph-blob absolute -top-32 left-1/4 h-[500px] w-[500px] opacity-15 dark:opacity-20"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.02) 50%, transparent 70%)" }} />
      <div className="orb-2 morph-blob absolute -right-20 top-1/4 h-[400px] w-[400px] opacity-10 dark:opacity-[0.15]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 50%, transparent 70%)" }} />
    </div>
  );
}

function WordReveal({ text, delay = 0 }) {
  const [ref, isVisible] = useScrollReveal();
  return (
    <span ref={ref}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="word-reveal inline-block mr-[0.28em]">
          <span style={{ animationDelay: `${delay + i * 75}ms`, animationPlayState: isVisible ? "running" : "paused", opacity: isVisible ? undefined : 0 }}>
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ─── Pillar Card ────────────────────────────────────── */
function PillarCard({ icon: Icon, title, blurb, tag, accent, accentRgb, index }) {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Light: solid white card, clean border, soft shadow
          Dark: dark surface with subtle backdrop blur and glow on hover */}
      <div className="card group relative h-full p-8 hover:shadow-card-hover-light dark:hover:shadow-card-dark cursor-default transition-transform hover:-translate-y-2">
        {/* Accent top bar on hover */}
        <div
          className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
        {/* Icon */}
        <div
          className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `rgba(${accentRgb}, 0.1)`, color: accent }}
        >
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <h3 className="mb-3 text-[16px] font-bold" style={{ color: "var(--rs-text-primary)" }}>{title}</h3>
        <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--rs-text-secondary)" }}>{blurb}</p>
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
          style={{ background: `rgba(${accentRgb}, 0.1)`, color: accent }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          {tag}
        </div>
      </div>
    </div>
  );
}

/* ─── Step Card ──────────────────────────────────────── */
function StepCard({ icon: Icon, title, body, index, total }) {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`relative flex gap-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Connector line */}
      {index < total - 1 && (
        <div
          className="absolute left-[22px] top-12 h-[calc(100%+1.5rem)] w-[2px]"
          style={{ background: "linear-gradient(180deg, rgba(37,99,235,0.35) 0%, rgba(37,99,235,0.04) 100%)" }}
        />
      )}
      {/* Icon bubble */}
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110"
          style={{ background: "var(--rs-elevated)", borderColor: "var(--rs-border)", color: "var(--rs-accent)" }}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white"
          style={{ background: "var(--rs-accent)" }}>
          {index + 1}
        </span>
      </div>
      {/* Content */}
      <div className="pb-10 pt-0.5">
        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--rs-accent)" }}>
          Step {index + 1}
        </p>
        <h3 className="mb-2 text-[16px] font-bold uppercase" style={{ color: "var(--rs-text-primary)" }}>{title}</h3>
        <p className="max-w-md text-sm leading-relaxed" style={{ color: "var(--rs-text-secondary)" }}>{body}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function Home() {
  const { t } = useTranslation("common");
  const { booting, isAuthenticated, role, session } = useAuth();
  const displayName = session?.session?.name || session?.session?.username || t("home.hero.there");
  const heroTiltRef = use3DTilt(4);
  const stats = getStats(t);
  const workerFlow = getWorkerFlow(t);

  useEffect(() => { document.title = "RideShield — Income Protection"; }, []);

  if (booting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--rs-border)", borderTopColor: "var(--rs-accent)" }} />
          <p className="text-sm" style={{ color: "var(--rs-text-secondary)" }}>{t("onboarding.form.restoring_session")}</p>
        </div>
      </div>
    );
  }

  /* ── CTA mapping by role ── */
  let heroTitle = t("home.hero.title_guest");
  let heroDescription = t("home.hero.description_guest");
  let primaryCta = { to: "/onboarding", label: t("home.cta.start_onboarding") };
  let secondaryCta = { to: "/how-it-works", label: t("home.cta.open_demo") };
  let showStats = true;

  if (isAuthenticated && role === "worker") {
    heroTitle = t("home.hero.title_worker", { name: displayName });
    heroDescription = t("home.hero.description_worker");
    primaryCta = { to: "/dashboard", label: t("home.cta.open_dashboard") };
    secondaryCta = { to: "/how-it-works", label: t("howItWorks.hero_title") };
  } else if (isAuthenticated && role === "admin") {
    heroTitle = t("home.hero.title_worker", { name: displayName });
    heroDescription = t("auth.sidebar.p2");
    primaryCta = { to: "/admin", label: t("home.cta.open_admin") };
    secondaryCta = { to: "/how-it-works", label: t("home.cta.run_scenarios") };
  }

  const pillars = [
    { icon: ShieldCheck, title: t("home.pillars.0.title"), blurb: t("home.pillars.0.description"), tag: t("home.pillars.0.tag"), accent: "#2563EB", accentRgb: "37,99,235" },
    { icon: Radar,       title: t("home.pillars.1.title"), blurb: t("home.pillars.1.description"), tag: t("home.pillars.1.tag"), accent: "#3b82f6", accentRgb: "59,130,246" },
    { icon: Wallet,      title: t("home.pillars.2.title"), blurb: t("home.pillars.2.description"), tag: t("home.pillars.2.tag"), accent: "#8b5cf6", accentRgb: "139,92,246" },
  ];

  return (
    <div className="overflow-x-hidden">
      <GlobalCursorGlow />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 pb-24 pt-6 sm:pt-12">
        <FloatingOrbs />

        {/* Light mode: subtle dot grid. Dark mode: same but more visible */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 20%, transparent 100%)",
          }}
        />

        {/* Live badge */}
        <div className="mb-10 flex justify-center reveal-up" style={{ animationDelay: "0.05s" }}>
          <Link to="/how-it-works"
            className="group flex items-center gap-2.5 rounded-full px-4 py-2 text-[12px] font-bold transition-all duration-200"
            style={{ background: "var(--rs-elevated)", border: "1px solid var(--rs-border)", color: "var(--rs-text-secondary)" }}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "var(--rs-accent)" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--rs-accent)" }} />
            </span>
            <span style={{ color: "var(--rs-accent)" }}>{t("home.hero.badge")}</span>
            <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" style={{ color: "var(--rs-accent)" }} />
          </Link>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="font-headline text-[2.6rem] font-black leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-[5rem]"
            style={{ color: "var(--rs-text-primary)" }}
          >
            <span className="block reveal-up" style={{ animationDelay: "0.1s" }}>
              {heroTitle.split(/[.।]/)[0]}.
            </span>
            <span className="relative mt-2 block reveal-up" style={{ animationDelay: "0.25s" }}>
              <span className="text-shimmer font-extrabold tracking-[-0.04em]">
                {heroTitle.split(/[.।]/)[1] || t("home.hero.subtitle")}
              </span>
            </span>
          </h1>
          <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed sm:text-xl reveal-up"
            style={{ color: "var(--rs-text-secondary)", animationDelay: "0.4s" }}>
            {heroDescription}
          </p>

          {role !== "worker" && (
            <div className="mt-8 mb-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5 reveal-up" 
                 style={{ background: "rgba(37,99,235,0.08)", color: "var(--rs-accent)", border: "1px solid rgba(37,99,235,0.2)", animationDelay: "0.45s" }}>
              <span className="font-bold text-sm tracking-tight text-blue-600 dark:text-blue-400">{t("home.hero.price_tag")}</span>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center reveal-up" style={{ animationDelay: "0.55s" }}>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={primaryCta.to}
              className="button-primary min-w-[220px] px-8 py-4 text-[15px]"
            >
              {primaryCta.label}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to={secondaryCta.to}
              className="button-secondary min-w-[180px] px-8 py-4 text-[15px]"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        {showStats && (
          <div className="mx-auto mt-14 max-w-3xl reveal-up" style={{ animationDelay: "0.7s" }}>
            {/* Light: solid white card with border
                Dark: dark surface with subtle glow */}
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl sm:grid-cols-4"
              style={{ background: "var(--rs-surface)", border: "1px solid var(--rs-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
            >
              {stats.map(({ value, label, icon: StatIcon }, i) => (
                <div key={label} className="flex flex-col items-center px-4 py-6 text-center"
                  style={{ borderRight: i < 3 ? `1px solid var(--rs-border)` : "none" }}>
                  <StatIcon size={16} className="mb-2" style={{ color: "var(--rs-accent)" }} />
                  <span className="text-2xl font-black tracking-tight" style={{ color: "var(--rs-text-primary)" }}>
                    <AnimatedCounter value={value} />
                  </span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--rs-text-secondary)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Pillars ───────────────────────────────────── */}
      <section className="border-t py-20 sm:py-28" style={{ borderColor: "var(--rs-border)", background: "var(--rs-elevated)" }}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="eyebrow mb-3 reveal-up">{t("home.core.eyebrow")}</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "var(--rs-text-primary)" }}>
              <WordReveal text={t("home.core.built_for")} delay={0} />
            </h2>
            <p className="mt-5 text-base leading-relaxed reveal-up" style={{ color: "var(--rs-text-secondary)", animationDelay: "0.3s" }}>
              {t("home.core.description")}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((p, i) => <PillarCard key={p.title} {...p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Vertical Walkthrough ──────────────────────── */}
      <section className="border-t py-20 sm:py-28" style={{ borderColor: "var(--rs-border)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-16 md:grid-cols-2 lg:gap-24">

            {/* Sticky left panel — glass-hero = elevated surface */}
            <div className="md:sticky md:top-28 md:h-fit">
              <div className="glass-hero p-8 sm:p-12 relative overflow-hidden group rounded-[2rem]">
                {/* Decorative shield */}
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12 pointer-events-none" style={{ color: "var(--rs-accent)" }}>
                  <Shield size={160} strokeWidth={0.5} />
                </div>
                <p className="mb-4 text-[12px] font-black uppercase tracking-[0.28em] text-blue-200 reveal-up">
                  {t("home.system.eyebrow")}
                </p>
                <h2 className="text-4xl font-black leading-[1.1] sm:text-5xl tracking-[-0.025em] text-white reveal-up">
                  {t("home.system.title")}
                </h2>
                <p className="mt-7 text-base leading-relaxed text-white/75 reveal-up" style={{ animationDelay: "0.15s" }}>
                  {t("home.system.description")}
                </p>
                <div className="mt-9 reveal-up" style={{ animationDelay: "0.3s" }}>
                  <Link to="/how-it-works"
                    className="inline-flex items-center gap-2 text-[14px] font-bold text-blue-200 hover:text-white transition-colors group/link">
                    <span>{t("home.cta.open_demo")}</span>
                    <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {workerFlow.map((step, i) => (
                <StepCard key={i} {...step} index={i} total={workerFlow.length} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────── */}
      <section className="px-4 pb-20 pt-8">
        <div className="cta-banner mx-auto max-w-4xl p-10 text-center">
          {/* Carbon-fiber texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: "var(--rs-text-primary)" }}>
              {t("home.footer.start_today")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base font-medium" style={{ color: "var(--rs-text-secondary)" }}>
              {t("home.stats.join_partners", { count: "2,400" })}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/onboarding"
                className="button-primary min-w-[180px] px-8 py-4 text-[15px]">
                {t("home.cta.register_now")}
              </Link>
              <Link to="/auth"
                className="button-secondary min-w-[180px] px-8 py-4 text-[15px]">
                {t("home.cta.sign_in")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

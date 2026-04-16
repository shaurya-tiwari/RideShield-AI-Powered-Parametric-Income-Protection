import { useTranslation } from "react-i18next";
import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, CalendarDays, Clock3, MapPin, Radar,
  ShieldCheck, Wallet, Zap, ChevronRight, Sparkles, CloudRain, ThermometerSun, WifiOff, Bell
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import TiltWrapper from "../components/TiltWrapper";
import GlobalCursorGlow from "../components/GlobalCursorGlow";

/* ─── Data ─── */
const getWorkerFlow = (t) => [
  { step: t("howItWorks.workerFlow.step1_step"), title: t("howItWorks.workerFlow.step1_title"), body: t("howItWorks.workerFlow.step1_body") },
  { step: t("howItWorks.workerFlow.step2_step"), title: t("howItWorks.workerFlow.step2_title"), body: t("howItWorks.workerFlow.step2_body") },
  { step: t("howItWorks.workerFlow.step3_step"), title: t("howItWorks.workerFlow.step3_title"), body: t("howItWorks.workerFlow.step3_body") },
  { step: t("howItWorks.workerFlow.step4_step"), title: t("howItWorks.workerFlow.step4_title"), body: t("howItWorks.workerFlow.step4_body") },
  { step: t("howItWorks.workerFlow.step5_step"), title: t("howItWorks.workerFlow.step5_title"), body: t("howItWorks.workerFlow.step5_body") },
];
const getPolicyEngine = (t) => [
  { title: t("howItWorks.policyEngine.weekly_cover"),   detail: t("howItWorks.policyEngine.weekly_cover_detail") },
  { title: t("howItWorks.policyEngine.trigger_aware"),  detail: t("howItWorks.policyEngine.trigger_aware_detail") },
  { title: t("howItWorks.policyEngine.waiting_period"), detail: t("howItWorks.policyEngine.waiting_period_detail") },
  { title: t("howItWorks.policyEngine.zone_logic"),     detail: t("howItWorks.policyEngine.zone_logic_detail") },
];
const getEngineSections = (t) => [
  { title: t("howItWorks.systemLayers.trigger_engine"),  text: t("howItWorks.systemLayers.trigger_engine_detail") },
  { title: t("howItWorks.systemLayers.claim_processor"), text: t("howItWorks.systemLayers.claim_processor_detail") },
  { title: t("howItWorks.systemLayers.decision_engine"), text: t("howItWorks.systemLayers.decision_engine_detail") },
  { title: t("howItWorks.systemLayers.payout_executor"), text: t("howItWorks.systemLayers.payout_executor_detail") },
];

/* ─── 3D Tilt Hook ─── */
function use3DTilt(intensity = 8) {
  const ref = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * -intensity;
    const ry = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * intensity;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1.015)`;
  }, [intensity]);
  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)";
  }, []);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => { el.removeEventListener("mousemove", handleMouseMove); el.removeEventListener("mouseleave", handleMouseLeave); };
  }, [handleMouseMove, handleMouseLeave]);
  return ref;
}

export default function HowItWorks() {
  const { t } = useTranslation();
  const heroTiltRef = use3DTilt(4);
  const workerFlow  = getWorkerFlow(t);
  const policyEngine = getPolicyEngine(t);
  const engineSections = getEngineSections(t);

  useEffect(() => { document.title = "How RideShield Works"; }, []);

  return (
    <div className="pb-32">
      <GlobalCursorGlow />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-b"
        style={{ borderColor: "var(--rs-border)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr] items-stretch">

        {/* Left: info card
            Light: solid white card with crisp border
            Dark:  glass-card-3d with backdrop blur */}
        <TiltWrapper intensity={4}
          className="glass-card-3d p-10 lg:p-14 relative overflow-hidden group transition-all duration-500">

          {/* Dark-only grid mesh */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
            style={{
              backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(circle at top left, black, transparent 75%)",
              WebkitMaskImage: "radial-gradient(circle at top left, black, transparent 75%)",
            }}
          />

          <div className="relative z-10">
            <p className="eyebrow mb-5 reveal-up">{t("howItWorks.hero_eyebrow")}</p>
            <h1 className="font-headline mt-2 max-w-2xl text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl tracking-[-0.03em] reveal-up"
              style={{ color: "var(--rs-text-primary)" }}>
              {t("howItWorks.hero_title")}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed reveal-up" style={{ color: "var(--rs-text-secondary)", animationDelay: "0.15s" }}>
              {t("howItWorks.hero_desc")}
            </p>

            <div className="mt-10 flex flex-wrap gap-4 reveal-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/onboarding" className="button-primary px-7 py-3.5 text-[14px] gap-2">
                {t("howItWorks.btn_explore")}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/auth" className="button-secondary px-7 py-3.5 text-[14px]">
                {t("howItWorks.btn_signin")}
              </Link>
            </div>
          </div>
        </TiltWrapper>

        {/* Right: Promise card — glass-hero = solid teal in both modes */}
        <div className="glass-hero p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-[2rem]"
          style={{ minHeight: "22rem" }}>
          <div className="absolute right-0 bottom-0 text-white/[0.06] pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
            <Sparkles size={180} strokeWidth={0.5} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-200">
            {t("howItWorks.promise_eyebrow")}
          </p>
          <p className="mt-6 text-3xl lg:text-4xl font-black leading-[1.15] text-white max-w-sm">
            {t("howItWorks.promise_text")}
          </p>
          <p className="mt-9 text-[10px] font-black tracking-widest text-blue-200 group-hover:text-white transition-colors uppercase">
            {t("howItWorks.diff_text")}
          </p>
        </div>
        </div>
      </section>

      {/* ── SYSTEM ARCHITECTURE ───────────────────────── */}
      <section className="py-20 lg:py-28 border-b" style={{ borderColor: "var(--rs-border)", background: "var(--rs-elevated)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t("howItWorks.systemLayers.eyebrow")}
            title={t("howItWorks.systemLayers.title")}
            description={t("howItWorks.systemLayers.desc")}
          />

          <div className="grid lg:grid-cols-2 gap-16 mt-20 lg:mt-24 items-center">
            {/* Left: Stack of features */}
            <div className="flex flex-col gap-6">
              {engineSections.map(({ title, text }, index) => {
                const Icon = [Radar, Activity, ShieldCheck, Wallet][index];
                return (
                  <div key={title} className="glass-card-3d flex items-start gap-5 p-6 transition-all duration-400 hover:-translate-y-1 hover:shadow-lg group w-full">
                    <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-400 group-hover:scale-110"
                      style={{ background: "var(--rs-elevated)", color: "var(--rs-accent)", border: "1px solid var(--rs-border)" }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="mb-1.5 text-[15px] font-bold" style={{ color: "var(--rs-text-primary)" }}>{title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--rs-text-secondary)" }}>{text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Mock Phone Notification Animation */}
            <div className="relative flex items-center justify-center min-h-[400px]">
              {/* Abstract phone frame */}
              <div className="relative w-[300px] h-[600px] rounded-[3rem] border-[8px] p-4 flex flex-col items-center bg-[#09090B] overflow-hidden" style={{ borderColor: "var(--rs-border)" }}>
                {/* Notch */}
                <div className="absolute top-0 w-32 h-6 bg-zinc-900 rounded-b-3xl"></div>
                
                {/* Dynamic Wallpaper */}
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(circle at top left, rgba(59,130,246,0.3), transparent 60%), radial-gradient(circle at bottom right, rgba(16,185,129,0.1), transparent 50%)"
                  }}
                />

                {/* Notification Card */}
                <div className="relative mt-24 w-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-2xl reveal-up animate-float-slightly" style={{ animationDelay: "0.2s" }}>
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                      <Bell size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white uppercase tracking-wider">{t("howItWorks.notification.app_name")}</p>
                      <p className="text-[10px] text-zinc-300">{t("howItWorks.notification.just_now")}</p>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{t("howItWorks.notification.title")}</h4>
                  <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                    {t("howItWorks.notification.body")}
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-green-100">{t("howItWorks.notification.payout")}</span>
                    <span className="text-sm font-black text-green-400">₹500</span>
                  </div>
                </div>

                {/* Secondary notification */}
                <div className="relative mt-4 w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl reveal-up opacity-50 transition-opacity hover:opacity-100 animate-float-slightly" style={{ animationDelay: "0.6s" }}>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-zinc-200">{t("howItWorks.notification.transfer_title")}</span>
                     <span className="text-xs text-zinc-400">{t("howItWorks.notification.one_min_ago")}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2">{t("howItWorks.notification.transfer_desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POLICY ENGINE ─────────────────────────────── */}
      <section className="py-20 lg:py-28 border-b" style={{ borderColor: "var(--rs-border)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("howItWorks.policyEngine.eyebrow")}
          title={t("howItWorks.policyEngine.title")}
          description={t("howItWorks.policyEngine.desc")}
        />
        <div className="grid gap-6 md:grid-cols-12 mt-20 lg:mt-24">
          {policyEngine.map((item, index) => {
            const Icon = [CalendarDays, Zap, Clock3, MapPin][index];
            const spans = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"][index];
            const isHero = index === 0 || index === 3;
            const isTriggerAware = index === 1;

            return isHero ? (
              /* glass-hero = solid teal: always readable */
              <div key={item.title} className={`${spans} glass-hero group p-10 lg:p-12 transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-white transition-transform duration-400 group-hover:scale-110">
                  <Icon size={26} />
                </div>
                <h3 className="mt-9 text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/75 max-w-md">{item.detail}</p>
              </div>
            ) : (
              /* Regular glass-card — solid in light, glass in dark */
              <div key={item.title} className={`${spans} glass-card-3d group p-10 lg:p-12 transition-all duration-400 hover:-translate-y-2 hover:shadow-xl`}>
                {isTriggerAware ? (
                  <div className="flex gap-2">
                    {[CloudRain, ThermometerSun, WifiOff].map((IconComp, idx) => (
                      <div key={idx} className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-400 group-hover:scale-110"
                        style={{ background: "var(--rs-elevated)", color: "var(--rs-accent)", border: "1px solid var(--rs-border)" }}>
                        <IconComp size={22} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-400 group-hover:scale-110"
                    style={{ background: "var(--rs-elevated)", color: "var(--rs-accent)", border: "1px solid var(--rs-border)" }}>
                    <Icon size={26} />
                  </div>
                )}
                <h3 className="mt-9 text-2xl font-black" style={{ color: "var(--rs-text-primary)" }}>{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed max-w-md" style={{ color: "var(--rs-text-secondary)" }}>{item.detail}</p>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* ── WORKER FLOW ───────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("howItWorks.workerFlow.eyebrow")}
          title={t("howItWorks.workerFlow.title")}
          description={t("howItWorks.workerFlow.desc")}
        />

        <div className="relative isolate flex flex-col lg:flex-row gap-6 mt-20 lg:mt-24">
          {/* Connector line — dark only shows glow */}
          <div className="absolute top-[52px] left-[5%] w-[90%] h-px hidden lg:block"
            style={{ background: "linear-gradient(90deg, transparent, var(--rs-border), transparent)" }} />

          {workerFlow.map((item, index) => (
            <div key={index}
              className="group relative z-10 flex-1 card p-8 transition-all duration-400 hover:-translate-y-3 hover:shadow-xl">
              {/* Step number watermark */}
              <div className="absolute right-4 top-3 text-[80px] font-black pointer-events-none select-none leading-none"
                style={{ color: "var(--rs-border)", opacity: 0.5 }}>
                {index + 1}
              </div>
              {/* Circle badge */}
              <div className="mb-6 relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-white font-black text-sm transition-transform duration-400 group-hover:scale-110"
                style={{ background: "var(--rs-accent)" }}>
                {index + 1}
              </div>
              <h3 className="mt-1 text-[15px] font-bold" style={{ color: "var(--rs-text-primary)" }}>{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--rs-text-secondary)" }}>{item.body}</p>
            </div>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}

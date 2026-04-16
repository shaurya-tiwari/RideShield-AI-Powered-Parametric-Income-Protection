import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ChevronDown, ChevronUp, MapPin, RefreshCcw, Shield, ShieldCheck, ShieldOff, Wallet, Sparkles } from "lucide-react";
import { SkeletonBlock, SkeletonText } from "../components/Skeleton";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../auth/AuthContext";
import { claimsApi } from "../api/claims";
import { eventsApi } from "../api/events";
import { payoutsApi } from "../api/payouts";
import { policiesApi } from "../api/policies";
import { workersApi } from "../api/workers";
import ActivePolicyCard from "../components/ActivePolicyCard";
import ClaimDetailPanel from "../components/ClaimDetailPanel";
import ClaimList from "../components/ClaimList";
import DecisionPanel from "../components/DecisionPanel";
import ErrorState from "../components/ErrorState";
import EventPanel from "../components/EventPanel";
import PayoutHistory from "../components/PayoutHistory";
import RiskScoreCard from "../components/RiskScoreCard";
import TrustBadge from "../components/TrustBadge";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { formatCurrency, formatDateTime, humanizeSlug } from "../utils/formatters";
import { getDisruptionTone } from "../utils/toneHelpers";
import { useTranslation } from "react-i18next";

function claimPriority(claim) {
  if (!claim) return -1;
  if (claim.status === "delayed") return 3;
  if (claim.status === "rejected") return 2;
  if (claim.status === "approved") return 1;
  return 0;
}

/* ─── Policy Gate: First-time user ─── */
function FirstTimeGate({ workerId, onPurchased }) {
  const { t } = useTranslation();
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    policiesApi.plans(workerId).then((res) => {
      setPlans(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [workerId]);

  async function handlePurchase(planName) {
    setPurchasing(planName);
    try {
      await policiesApi.create({ worker_id: workerId, plan_name: planName });
      toast.success(t("dashboard.purchase.success"));
      onPurchased();
    } catch (err) {
      toast.error(err.response?.data?.detail || t("dashboard.purchase.failed"));
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-cta-gradient text-white shadow-glow-cyan">
          <Shield size={36} strokeWidth={2} />
        </div>
        <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {t("dashboard.firstTimeGate.title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
          {t("dashboard.firstTimeGate.description")}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card-3d p-8">
              <SkeletonBlock className="h-6 w-1/2 mb-4" />
              <SkeletonBlock className="h-10 w-2/3 mb-3" />
              <SkeletonText lines={2} />
              <SkeletonBlock className="h-12 w-full mt-6 rounded-xl" />
            </div>
          ))}
        </div>
      ) : plans?.plans ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.plans.map((plan) => (
            <div
              key={plan.plan_name}
              className={`glass-card-3d relative p-8 transition-all hover:-translate-y-2 ${
                plan.plan_name === plans.recommended ? "border-2 border-teal-500/50 shadow-glow-cyan" : ""
              }`}
            >
              {plan.plan_name === plans.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                  {t("dashboard.firstTimeGate.recommended")}
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.display_name}</h3>
              <p className="mt-4 text-4xl font-black text-slate-950 dark:text-white">
                {formatCurrency(plan.weekly_premium)}
                <span className="ml-1 text-sm font-bold text-slate-400">{t("dashboard.firstTimeGate.per_week")}</span>
              </p>
              <p className="mt-3 text-sm font-medium text-teal-600 dark:text-teal-400">
                {t("dashboard.firstTimeGate.up_to_coverage", { amount: formatCurrency(plan.coverage_cap) })}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {(plan.triggers_covered || []).map((trig) => (
                  <span key={trig} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    {humanizeSlug(trig)}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="button-primary mt-8 w-full !rounded-xl"
                disabled={!!purchasing}
                onClick={() => handlePurchase(plan.plan_name)}
              >
                {purchasing === plan.plan_name ? t("dashboard.firstTimeGate.purchasing") : t("dashboard.firstTimeGate.buy")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500">{t("dashboard.firstTimeGate.error")}</div>
      )}
    </div>
  );
}

/* ─── Policy Gate: Expired user ─── */
function ExpiredGate({ workerId, lastPolicy, onPurchased }) {
  const { t } = useTranslation();
  const [purchasing, setPurchasing] = useState(false);

  async function handleRenew() {
    setPurchasing(true);
    try {
      await policiesApi.create({ worker_id: workerId, plan_name: lastPolicy.plan_name });
      toast.success(t("dashboard.expiredGate.renew_success"));
      onPurchased();
    } catch (err) {
      toast.error(err.response?.data?.detail || t("dashboard.expiredGate.renew_failed"));
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-glow-amber">
          <ShieldOff size={36} strokeWidth={2} />
        </div>
        <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {t("dashboard.expiredGate.title")}
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
          {t("dashboard.expiredGate.description")}
        </p>
      </div>

      <div className="glass-card-3d p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("dashboard.expiredGate.last_plan")}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {lastPolicy.display_name || humanizeSlug(lastPolicy.plan_name)}
            </h3>
          </div>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
            {t("dashboard.expiredGate.expired")}
          </span>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/5 shadow-glass-inset">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("dashboard.expiredGate.premium_was")}</p>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(lastPolicy.weekly_premium)}<span className="text-xs font-bold text-slate-400">/wk</span>
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/5 shadow-glass-inset">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("dashboard.expiredGate.coverage_cap")}</p>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(lastPolicy.coverage_cap)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/5 shadow-glass-inset text-center sm:text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("dashboard.expiredGate.expired_on")}</p>
            <p className="mt-2 text-[13px] font-bold text-slate-700 dark:text-slate-300">
              {formatDateTime(lastPolicy.expired_at).split(',')[0]}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="button-primary mt-8 w-full !rounded-xl h-14"
          disabled={purchasing}
          onClick={handleRenew}
        >
          {purchasing ? t("dashboard.expiredGate.renewing") : t("dashboard.expiredGate.renew")}
        </button>
      </div>

      <p className="text-center text-sm font-medium text-slate-500">
        {t("dashboard.expiredGate.want_different")}{" "}
        <button
          type="button"
          className="font-bold text-teal-600 hover:underline dark:text-teal-400"
          onClick={() => window.location.reload()}
        >
          {t("dashboard.expiredGate.view_all")}
        </button>
      </p>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const { t } = useTranslation();
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [worker, setWorker] = useState(null);
  const [policyState, setPolicyState] = useState(null);
  const [claims, setClaims] = useState(null);
  const [payouts, setPayouts] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimDetailOpen, setClaimDetailOpen] = useState(false);

  const effectiveWorkerId = workerId || session?.session?.worker_id;

  const load = useCallback(async () => {
    if (!effectiveWorkerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [workerRes, policyRes, claimsRes, payoutsRes, eventsRes] = await Promise.all([
        workersApi.profile(effectiveWorkerId),
        policiesApi.active(effectiveWorkerId),
        claimsApi.worker(effectiveWorkerId, { days: 30 }),
        payoutsApi.worker(effectiveWorkerId, { days: 30 }),
        eventsApi.active(),
      ]);

      const claimsPayload = claimsRes.data;
      setWorker(workerRes.data);
      setPolicyState(policyRes.data);
      setClaims(claimsPayload);
      setPayouts(payoutsRes.data);
      setEvents(eventsRes.data.events || []);
      setSelectedClaim((current) => {
        if (current) return current;
        const claimsList = [...(claimsPayload.claims || [])];
        claimsList.sort((a, b) => {
          const statusDelta = claimPriority(b) - claimPriority(a);
          if (statusDelta !== 0) return statusDelta;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        return claimsList[0] || null;
      });
    } catch (err) {
      setError(err?.response?.data?.detail || t("dashboard.states.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [effectiveWorkerId, t]);

  useEffect(() => {
    document.title = "Worker Dashboard | RideShield";
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      if (!selectedClaim?.id) {
        return;
      }
      const detail = await claimsApi.detail(selectedClaim.id);
      if (active) {
        setSelectedClaim(detail.data);
        setClaimDetailOpen(true);
      }
    }

    if (selectedClaim?.id && !selectedClaim.decision_breakdown?.breakdown) {
      loadDetail();
    }

    return () => {
      active = false;
    };
  }, [selectedClaim?.id, selectedClaim?.decision_breakdown]);

  const latestPayout = payouts?.payouts?.[0];
  const approvedClaims = claims?.approved ?? 0;
  const totalClaims = claims?.total ?? 0;
  const activeDecisionClaim = selectedClaim || claims?.claims?.[0] || null;
  const urgentClaim =
    (claims?.claims || []).find((claim) => claim.status === "delayed") ||
    (claims?.claims || []).find((claim) => claim.status === "rejected") ||
    activeDecisionClaim;

  const coverageNarrative = useMemo(() => {
    if (latestPayout) {
      return t("dashboard.narrative.latest_payout", { amount: formatCurrency(latestPayout.amount) });
    }
    if (approvedClaims > 0) {
      return t("dashboard.narrative.approved_claims", { count: approvedClaims });
    }
    return t("dashboard.narrative.waiting");
  }, [latestPayout, approvedClaims, t]);
  
  const latestPayoutState =
    latestPayout?.status === "failed"
      ? t("dashboard.payoutState.failed")
      : latestPayout?.status === "processing"
        ? t("dashboard.payoutState.processing")
        : latestPayout?.status === "pending"
          ? t("dashboard.payoutState.pending")
          : latestPayout
            ? t("dashboard.payoutState.credited")
            : t("dashboard.payoutState.none");

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <section className="mb-6 flex items-end justify-between gap-6">
          <div>
            <div className="mb-2 h-4 w-32 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-10 w-64 rounded bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="h-10 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
        </section>
        <div className="glass-hero p-8">
           <div className="mb-6 h-6 w-32 rounded-full bg-white/20" />
           <div className="mb-4 h-12 w-3/4 max-w-2xl rounded bg-white/20" />
           <div className="space-y-2 max-w-xl">
             <div className="h-4 w-full rounded bg-white/10" />
             <div className="h-4 w-2/3 rounded bg-white/10" />
           </div>
           <div className="mt-8 grid gap-4 grid-cols-12">
             <div className="col-span-12 sm:col-span-7 h-32 rounded-3xl bg-white/10" />
             <div className="col-span-12 sm:col-span-5 h-32 rounded-3xl bg-white/10" />
             <div className="col-span-12 h-32 rounded-3xl bg-white/10" />
           </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!worker) {
    return (
      <div className="panel p-8 text-center max-w-md mx-auto mt-20">
        <p className="text-xl font-bold text-slate-900 dark:text-white">{t("dashboard.states.worker_not_found")}</p>
        <button type="button" className="button-secondary mt-6 !rounded-xl" onClick={() => navigate("/auth")}>
          {t("dashboard.states.back_to_sign_in")}
        </button>
      </div>
    );
  }

  /* ─── Policy Gate ─── */
  const hasPolicy = policyState?.active_policy || policyState?.pending_policy;

  if (!hasPolicy) {
    const lastExpired = policyState?.last_expired_policy;
    if (lastExpired) {
      return (
        <ExpiredGate
          workerId={effectiveWorkerId}
          lastPolicy={lastExpired}
          onPurchased={() => load()}
        />
      );
    }
    return <FirstTimeGate workerId={effectiveWorkerId} onPurchased={() => load()} />;
  }

  const workerEvents = events.filter((event) => event.zone === worker.zone);
  const nearbyAlerts = workerEvents.slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header with quick actions */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-slate-400">
            <MapPin size={14} className="text-teal-500" />
            <span>
              {humanizeSlug(worker.city)} • {worker.zone ? humanizeSlug(worker.zone) : t("dashboard.no_zone")}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{t("dashboard.title")}</h1>
        </div>
        <button type="button" className="button-secondary group !rounded-xl !px-5 !py-2.5 shadow-glass-ring transition-all hover:-translate-y-0.5" onClick={load}>
          <RefreshCcw size={16} className="group-active:animate-spin" />
          {t("dashboard.states.refresh")}
        </button>
      </section>

      {/* Hero card section */}
      <div className="glass-hero p-8 perspective-scene relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/90 backdrop-blur-xl ring-1 ring-white/10">
            <ShieldCheck size={14} className="text-teal-400" />
            {t("dashboard.hero.zero_touch")}
          </div>
          <h2 className="mt-8 max-w-2xl text-4xl font-black leading-[1.1] text-white sm:text-5xl">
            {t("dashboard.hero.greeting", { name: worker.name })}
          </h2>
          <p className="mt-5 max-w-xl text-lg font-medium text-white/70 leading-relaxed">
            {t("dashboard.hero.description")}
          </p>

          <div className="mt-10 grid gap-6 grid-cols-12">
            <div className="col-span-12 sm:col-span-7 group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition-all hover:bg-white/10 shadow-glass-inset">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">{t("dashboard.stats.approved_claims")}</p>
              <p className="mt-5 text-6xl font-black text-white group-hover:scale-110 transition-transform origin-left">{approvedClaims}</p>
              <p className="mt-3 text-sm font-bold text-white/40">{t("dashboard.stats.of_total_claims", { count: totalClaims })}</p>
            </div>
            <div className="col-span-12 sm:col-span-5 group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition-all hover:bg-white/10 shadow-glass-inset">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">{t("dashboard.stats.total_payouts")}</p>
              <p className="mt-5 text-4xl font-black text-white">{formatCurrency(payouts?.total_amount)}</p>
              <div className="mt-3 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-teal-400 w-2/3 shadow-glow-cyan" />
              </div>
            </div>
            <div className="col-span-12 group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition-all hover:bg-white/10 shadow-glass-inset">
               <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">{t("dashboard.stats.coverage_window")}</p>
                  <p className="mt-5 text-2xl font-black text-white">{t("dashboard.stats.claims_tracked", { count: totalClaims })}</p>
                  <p className="mt-2 text-sm font-bold text-white/40">{t("dashboard.stats.latest_30_days")}</p>
                </div>
                <div className="h-16 w-32 hidden sm:block">
                  {/* Subtle abstract sparkline effect */}
                  <div className="flex items-end gap-1.5 h-full">
                    {[3, 5, 4, 7, 5, 8, 6, 9].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/20 rounded-t-sm transition-all hover:bg-teal-400" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
                </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-8">
          {/* Decision Panel */}
          <DecisionPanel claim={urgentClaim} narrative={coverageNarrative} />

          {/* Claim Detail (Collapsible) */}
          {urgentClaim && (
            <div className="glass-card-3d overflow-hidden !p-0">
              <button
                type="button"
                className="flex w-full items-center justify-between px-8 py-5 text-left transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                onClick={() => setClaimDetailOpen(!claimDetailOpen)}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("dashboard.detail.title")}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {humanizeSlug(urgentClaim.trigger_type || "incident")} — {humanizeSlug(urgentClaim.status)}
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-slate-100 p-2 dark:bg-white/10 transition-transform duration-300" style={{ transform: claimDetailOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                   <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
              </button>
              <div className={`transition-all duration-500 ease-in-out ${claimDetailOpen ? "max-h-[2000px] border-t border-slate-100 dark:border-white/5 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-2 sm:p-4">
                  <ClaimDetailPanel claim={urgentClaim} />
                </div>
              </div>
            </div>
          )}

          {/* Stats Multi-Card Grid */}
          <div className="grid gap-6 grid-cols-12 perspective-scene">
            <div className="col-span-12 md:col-span-7 glass-card-3d p-8 relative overflow-hidden">
               {/* Vertical accent */}
              <div className="absolute left-0 top-1/4 bottom-1/4 w-[4px] bg-emerald-500 rounded-r-full shadow-glow-cyan" />
              
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("dashboard.payout.eyebrow")}</p>
                  <p className="mt-5 text-6xl font-black text-slate-950 dark:text-white tracking-tighter">
                    {latestPayout ? formatCurrency(latestPayout.amount) : "₹0"}
                  </p>
                  <p className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {latestPayoutState}
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-glass-inset">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 glass-card-3d p-8 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("dashboard.status.eyebrow")}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-widest bg-opacity-10 ring-1 ring-inset ${
                    policyState?.active_policy 
                      ? "bg-emerald-500 text-emerald-600 ring-emerald-500/20" 
                      : "bg-amber-500 text-amber-600 ring-amber-500/20"
                  }`}>
                    <div className={`h-2.5 w-2.5 rounded-full ${policyState?.active_policy ? "bg-emerald-500 shadow-glow-cyan" : "bg-amber-500 shadow-glow-amber"}`} />
                    {policyState?.active_policy ? t("dashboard.status.active") : t("dashboard.status.pending")}
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">{t("dashboard.status.aware")}</p>
            </div>

            <div className="col-span-12 glass-card-3d p-8">
              <div className="flex items-center justify-between mb-8">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("dashboard.trust.eyebrow")}</p>
                <div className="flex items-center gap-1 bg-teal-500/5 px-2 py-1 rounded text-[10px] font-black text-teal-600">
                   <ShieldCheck size={12} />
                   PROTECTED
                </div>
              </div>
              <TrustScoreGauge score={worker.trust_score} />
            </div>
          </div>

          {/* History Sections */}
          <div className="glass-card-3d p-8 relative">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("dashboard.history.eyebrow")}</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{t("dashboard.history.title")}</h3>
              </div>
              {urgentClaim?.id ? (
                <button
                  type="button"
                  className="button-secondary !rounded-xl !px-4 !py-2.5 shadow-glass-inset text-[13px]"
                  onClick={() => {
                    setSelectedClaim(urgentClaim);
                    setClaimDetailOpen(true);
                  }}
                >
                  <ArrowDownRight size={16} />
                  {t("dashboard.history.focus_claim")}
                </button>
              ) : null}
            </div>
            <ClaimList claims={claims?.claims || []} onSelect={(claim) => { setSelectedClaim(claim); setClaimDetailOpen(true); }} />
          </div>

          <PayoutHistory data={payouts} />
        </div>

        <aside className="space-y-8">
          <ActivePolicyCard policy={policyState?.active_policy} pendingPolicy={policyState?.pending_policy} />
          
          <RiskScoreCard workerId={effectiveWorkerId} />

          {/* Disruption Feed / Alerts */}
          <div className="glass-card-3d p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("dashboard.alerts.eyebrow")}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Live Zone Pressure</h3>
              </div>
              <TrustBadge score={worker.trust_score} />
            </div>
            
            {nearbyAlerts.length > 0 ? (
              <div className="space-y-4">
                {nearbyAlerts.map((event) => {
                  const disruptionLevel = Number(event.disruption_score || 0);
                  const tone = getDisruptionTone(disruptionLevel);
                  return (
                    <div
                      key={event.id}
                      className={`group rounded-2xl border-l-4 p-5 transition-all hover:bg-slate-50 dark:hover:bg-white/5 shadow-glass-ring ${tone.border}`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
                          {(event.metadata_json?.fired_triggers || [event.event_type]).map(humanizeSlug).join(", ")}
                        </p>
                        <span className="text-xs font-black text-slate-500">
                          {Math.round(disruptionLevel * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div
                          className={`h-full rounded-full shadow-sm transition-all duration-1000 ${tone.progress}`}
                          style={{ width: `${Math.max(12, Math.round(disruptionLevel * 100))}%` }}
                        />
                      </div>
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {humanizeSlug(event.zone)} • {t("dashboard.alerts.signal_strength", { score: disruptionLevel.toFixed(2) })}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center dark:border-white/10">
                <p className="text-sm font-medium text-slate-500">No nearby disruptions active in your zone.</p>
              </div>
            )}
          </div>

          <EventPanel events={workerEvents} />
        </aside>
      </div>
    </div>
  );
}

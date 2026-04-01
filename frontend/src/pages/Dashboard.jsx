import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownRight, MapPin, RefreshCcw, ShieldCheck, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { claimsApi } from "../api/claims";
import { eventsApi } from "../api/events";
import { payoutsApi } from "../api/payouts";
import { policiesApi } from "../api/policies";
import { workersApi } from "../api/workers";
import ActivePolicyCard from "../components/ActivePolicyCard";
import ClaimDetailPanel from "../components/ClaimDetailPanel";
import ClaimList from "../components/ClaimList";
import EventPanel from "../components/EventPanel";
import PayoutHistory from "../components/PayoutHistory";
import RiskScoreCard from "../components/RiskScoreCard";
import TrustBadge from "../components/TrustBadge";
import TrustScoreGauge from "../components/TrustScoreGauge";
import { formatCurrency, humanizeSlug, statusPill } from "../utils/formatters";

function claimPriority(claim) {
  if (!claim) return -1;
  if (claim.status === "delayed") return 3;
  if (claim.status === "rejected") return 2;
  if (claim.status === "approved") return 1;
  return 0;
}

function DecisionPanel({ claim, narrative }) {
  const decisionState = claim?.status || "idle";
  const score =
    Number.isFinite(Number(claim?.final_score)) && Number(claim?.final_score) > 0
      ? `${Math.round(Number(claim.final_score) * 100)}% confidence`
      : "No active score";

  let heading = "No active claim needs attention right now.";
  let reason = "RideShield is monitoring your zone and will create a claim automatically if a covered incident is verified.";

  if (claim?.status === "delayed") {
    heading = "A delayed claim needs review context.";
    reason =
      claim.decision_breakdown?.explanation ||
      claim.rejection_reason ||
      "The latest claim moved into manual review because the engine found enough uncertainty to pause payout.";
  } else if (claim?.status === "approved") {
    heading = "Your latest decision is already approved.";
    reason =
      claim.decision_breakdown?.explanation ||
      "The latest covered incident passed policy, confidence, and fraud checks, so payout was released automatically.";
  } else if (claim?.status === "rejected") {
    heading = "The latest claim was rejected.";
    reason =
      claim.rejection_reason ||
      claim.decision_breakdown?.explanation ||
      "The incident failed one or more validation checks, so the payout path was closed.";
  }

  return (
    <div className="decision-panel card-primary p-6 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Decision panel</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-primary">{heading}</h2>
        </div>
        <span className={statusPill(decisionState)}>{humanizeSlug(decisionState)}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <span className="pill bg-primary/8 text-primary">{score}</span>
        {claim?.id ? <span className="pill bg-white text-ink/70">Claim {claim.id.slice(0, 6)}</span> : null}
      </div>

      <div className="mt-5 rounded-[22px] bg-white/75 p-4">
        <p className="text-sm font-semibold text-primary">Why this matters now</p>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">{reason}</p>
      </div>

      <div className="mt-5 rounded-[22px] border border-primary/10 bg-primary/3 p-4">
        <p className="text-sm font-semibold text-primary">Protection narrative</p>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">{narrative}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState(null);
  const [policyState, setPolicyState] = useState(null);
  const [claims, setClaims] = useState(null);
  const [payouts, setPayouts] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const effectiveWorkerId = workerId || session?.session?.worker_id;

  const load = useCallback(async () => {
    if (!effectiveWorkerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [effectiveWorkerId]);

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
      return `Latest payout ${formatCurrency(latestPayout.amount)} credited automatically after system validation.`;
    }
    if (approvedClaims > 0) {
      return `${approvedClaims} approved claims so far with zero worker filing steps.`;
    }
    return "Coverage is live and waiting for the next verified disruption in the worker zone.";
  }, [latestPayout, approvedClaims]);

  if (loading) {
    return <div className="panel p-8 text-center text-ink/60">Loading dashboard...</div>;
  }

  if (!worker) {
    return (
      <div className="panel p-8">
        <p className="text-xl font-bold">Worker not found</p>
        <button type="button" className="button-secondary mt-4" onClick={() => navigate("/auth")}>
          Back to sign in
        </button>
      </div>
    );
  }

  const workerEvents = events.filter((event) => event.zone === worker.zone);
  const nearbyAlerts = workerEvents.slice(0, 2);

  return (
    <div className="space-y-6">
      <section className="mb-6 flex items-end justify-between gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-on-surface-variant">
            <MapPin size={16} />
            <span>
              {humanizeSlug(worker.city)} - {worker.zone ? humanizeSlug(worker.zone) : "No zone"}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Worker Dashboard</h1>
        </div>
        <button type="button" className="button-secondary !rounded-full !py-2" onClick={load}>
          <RefreshCcw size={16} />
          Refresh
        </button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <section className="space-y-6">
          <div className="hero-glow hero-mesh rounded-[32px] p-8 scale-pop">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
              <ShieldCheck size={14} />
              Zero-touch claims
            </div>
            <h2 className="mt-6 max-w-2xl text-5xl font-bold leading-tight">
              {worker.name}, your protection runs in the background.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/78">
              RideShield watches disruption signals in your zone, merges overlapping triggers into one incident, checks
              policy coverage, and decides payout without asking you to file a manual claim.
            </p>

            <div className="mt-8 grid gap-4 grid-cols-12">
              <div className="col-span-12 sm:col-span-7 rounded-[22px] border-b-4 border-emerald-600 bg-white/10 p-6 transition-smooth hover:bg-white/15 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Approved claims</p>
                <p className="mt-4 text-5xl font-extrabold">{approvedClaims}</p>
                <p className="mt-2 text-xs text-white/60">Of {totalClaims} total claims filed</p>
              </div>
              <div className="col-span-12 sm:col-span-5 rounded-[22px] border-b-4 border-amber-500 bg-white/10 p-6 transition-smooth hover:bg-white/15 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Total payouts</p>
                <p className="mt-4 text-4xl font-extrabold">{formatCurrency(payouts?.total_amount)}</p>
              </div>
              <div className="col-span-12 rounded-[22px] border-b-4 border-blue-400 bg-white/10 p-6 transition-smooth hover:bg-white/15 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Coverage window</p>
                <p className="mt-4 text-2xl font-extrabold">{totalClaims} claims tracked</p>
                <p className="mt-2 text-xs text-white/60">Latest 30 days</p>
              </div>
            </div>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[1.02fr_0.98fr]">
            <DecisionPanel claim={urgentClaim} narrative={coverageNarrative} />
            <div className="space-y-4">
              <ClaimDetailPanel claim={urgentClaim} />
              <RiskScoreCard workerId={effectiveWorkerId} />
            </div>
          </div>

          <div className="grid gap-6 grid-cols-12">
            <div className="col-span-12 md:col-span-7 context-panel p-6 border-accent-left border-accent-success">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="eyebrow">Latest payout</p>
                  <p className="mt-4 text-5xl font-bold text-primary">
                    {latestPayout ? formatCurrency(latestPayout.amount) : "INR 0"}
                  </p>
                </div>
                <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/50">
                  <Wallet size={20} className="text-emerald-700" />
                </div>
              </div>
              <p className="mt-4 text-sm text-on-surface-variant">
                {latestPayout ? "Credited to wallet and recorded in payout history" : "No wallet transfer yet"}
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 context-panel p-6 border-accent-left border-accent-warning">
              <p className="eyebrow">Protection status</p>
              <div className="mt-4 flex items-center gap-3">
                <span
                  className={`pill ${
                    policyState?.active_policy ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <span
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${
                      policyState?.active_policy ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {policyState?.active_policy ? "Active and shielded" : "Pending activation"}
                </span>
              </div>
              <p className="mt-3 text-sm text-on-surface-variant">Coverage and waiting-period aware</p>
            </div>
            <div className="col-span-12 context-panel p-6">
              <p className="eyebrow">Trust score</p>
              <div className="mt-4">
                <TrustScoreGauge score={worker.trust_score} />
              </div>
            </div>
          </div>

          <div className="context-panel card-secondary p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow">Claims history</p>
                <h3 className="mt-2 text-2xl font-bold text-primary">Incident-aligned claim history</h3>
              </div>
              {urgentClaim?.id ? (
                <button
                  type="button"
                  className="button-secondary !rounded-full !py-2"
                  onClick={() => setSelectedClaim(urgentClaim)}
                >
                  <ArrowDownRight size={16} />
                  Focus current claim
                </button>
              ) : null}
            </div>
            <ClaimList claims={claims?.claims || []} onSelect={setSelectedClaim} />
          </div>

          <PayoutHistory data={payouts} />
        </section>

        <aside className="space-y-6">
          <ActivePolicyCard policy={policyState?.active_policy} pendingPolicy={policyState?.pending_policy} />

          <div className="context-panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow">Nearby alerts</p>
                <h3 className="mt-2 text-lg font-bold text-primary">Zone pressure</h3>
              </div>
              <TrustBadge score={worker.trust_score} />
            </div>
            {nearbyAlerts.length ? (
              <div className="space-y-3">
                {nearbyAlerts.map((event) => {
                  const disruptionLevel = Number(event.disruption_score || 0);
                  const getBorderColor = () => {
                    if (disruptionLevel >= 0.7) return "border-l-red-600 bg-red-50/50";
                    if (disruptionLevel >= 0.4) return "border-l-amber-600 bg-amber-50/50";
                    return "border-l-blue-600 bg-blue-50/50";
                  };
                  const getProgressColor = () => {
                    if (disruptionLevel >= 0.7) return "bg-red-600";
                    if (disruptionLevel >= 0.4) return "bg-amber-600";
                    return "bg-blue-600";
                  };
                  return (
                    <div
                      key={event.id}
                      className={`rounded-[16px] border-l-2 p-3 text-sm opacity-90 transition-smooth hover:shadow-md ${getBorderColor()}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-on-surface">
                          {(event.metadata_json?.fired_triggers || [event.event_type]).map(humanizeSlug).join(", ")}
                        </p>
                        <span className="text-xs font-bold text-on-surface">
                          {Math.round(disruptionLevel * 100)}%
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressColor()}`}
                          style={{ width: `${Math.max(12, Math.round(disruptionLevel * 100))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                        {humanizeSlug(event.zone)} - risk {disruptionLevel.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-sm text-on-surface-variant">No nearby active disruptions right now.</p>
              </div>
            )}
          </div>

          <EventPanel events={workerEvents} />
        </aside>
      </div>
    </div>
  );
}

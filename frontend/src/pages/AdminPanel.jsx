import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, ShieldAlert } from "lucide-react";

import { analyticsApi } from "../api/analytics";
import { claimsApi } from "../api/claims";
import { eventsApi } from "../api/events";
import { locationsApi } from "../api/locations";
import { payoutsApi } from "../api/payouts";
import DisruptionMap from "../components/DisruptionMap";
import EventPanel from "../components/EventPanel";
import ForecastCards from "../components/ForecastCards";
import ModelHealthBadge from "../components/ModelHealthBadge";
import ReviewQueue from "../components/ReviewQueue";
import { groupClaimsByIncident } from "../utils/claimGroups";
import { formatCurrency, formatPercent, formatRelative, humanizeSlug, statusPill } from "../utils/formatters";

function KpiTile({ label, value, hint, accent = "default" }) {
  const accentClass = {
    default: "bg-surface-container-lowest",
    soft: "bg-surface-container-low",
    dark: "bg-[radial-gradient(circle_at_top_right,_rgba(133,189,188,0.16),_transparent_30%),linear-gradient(135deg,#003535_0%,#0d4d4d_100%)] text-on-primary",
  }[accent];

  return (
    <div className={`rounded-[22px] border border-outline-variant/40 p-5 shadow-[0_12px_30px_rgba(26,28,25,0.05)] ${accentClass}`}>
      <p
        className={`text-[11px] font-bold uppercase tracking-[0.24em] ${
          accent === "dark" ? "text-white/55" : "text-on-surface-variant"
        }`}
      >
        {label}
      </p>
      <p className={`mt-3 text-4xl font-bold ${accent === "dark" ? "text-white" : "text-primary"}`}>{value}</p>
      <p className={`mt-2 text-sm ${accent === "dark" ? "text-white/75" : "text-on-surface-variant"}`}>{hint}</p>
    </div>
  );
}

function NextDecisionPanel({ incident }) {
  if (!incident) {
    return (
      <div className="decision-panel p-6">
        <p className="eyebrow">Next decision</p>
        <h3 className="mt-3 text-2xl font-bold text-primary">No delayed claim needs action right now.</h3>
        <p className="mt-4 text-sm leading-7 text-on-surface-variant">
          The review queue is clear. Logs, incidents, and forecast cards below are supporting context rather than active
          blockers.
        </p>
      </div>
    );
  }

  const triggerTypes = Array.isArray(incident.trigger_types)
    ? incident.trigger_types
    : incident.trigger_type
      ? [incident.trigger_type]
      : [];

  return (
    <div className="decision-panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Next decision</p>
          <h3 className="mt-3 text-2xl font-bold text-primary">{incident.worker_name}</h3>
        </div>
        <span className={statusPill(incident.status)}>{humanizeSlug(incident.status)}</span>
      </div>

      <p className="mt-4 text-sm leading-7 text-on-surface-variant">
        {(triggerTypes.length ? triggerTypes.map(humanizeSlug).join(", ") : "No trigger context")} - {humanizeSlug(incident.zone || "zone")}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[20px] bg-white/75 p-4">
          <p className="text-sm text-on-surface-variant">Fraud score</p>
          <p className="mt-2 text-2xl font-bold text-primary">{Math.round(Number(incident.max_fraud_score || 0) * 100)}%</p>
        </div>
        <div className="rounded-[20px] bg-white/75 p-4">
          <p className="text-sm text-on-surface-variant">Payout at risk</p>
          <p className="mt-2 text-2xl font-bold text-primary">{formatCurrency(incident.total_calculated_payout)}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-primary/10 bg-primary/3 p-4">
        <p className="text-sm font-semibold text-primary">Why this is surfaced first</p>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">
          This grouped incident is already delayed and should be resolved before the passive logs below. Operational
          review should start here, not in the feed history.
        </p>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [cityOptions, setCityOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimStats, setClaimStats] = useState(null);
  const [payoutStats, setPayoutStats] = useState(null);
  const [queue, setQueue] = useState(null);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    document.title = "Admin Panel | RideShield";
  }, []);

  useEffect(() => {
    load();
    loadCities();
  }, []);

  async function loadCities() {
    try {
      const response = await locationsApi.cities();
      setCityOptions(response.data || []);
    } catch {
      setCityOptions([]);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const [claimsRes, payoutsRes, queueRes, eventsRes, historyRes, analyticsRes] = await Promise.all([
        claimsApi.stats({ days: 14 }),
        payoutsApi.stats({ days: 14 }),
        claimsApi.queue(),
        eventsApi.active(),
        eventsApi.history({ days: 14, limit: 20 }),
        analyticsApi.adminOverview({ days: 14 }),
      ]);
      setClaimStats(claimsRes.data);
      setPayoutStats(payoutsRes.data);
      setQueue(queueRes.data);
      setEvents([...(eventsRes.data.events || []), ...(historyRes.data.events || []).slice(0, 6)]);
      setAnalytics(analyticsRes.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(claimId, decision) {
    setResolvingId(claimId);
    try {
      await claimsApi.resolve(claimId, {
        decision,
        reviewed_by: "admin_panel",
        reason: decision === "reject" ? "Rejected from admin panel." : "Approved from admin panel.",
      });
      await load();
    } finally {
      setResolvingId(null);
    }
  }

  const cityFilteredEvents = selectedCity === "all" ? events : events.filter((event) => event.city === selectedCity);
  const zoneOptions = useMemo(
    () => [...new Set(cityFilteredEvents.map((event) => event.zone).filter(Boolean))],
    [cityFilteredEvents],
  );
  const visibleEvents =
    selectedZone === "all" ? cityFilteredEvents : cityFilteredEvents.filter((event) => event.zone === selectedZone);
  const queueClaims = queue?.claims || [];
  const filteredQueueClaims = queueClaims.filter((claim) => {
    const cityMatch = selectedCity === "all" || claim.city === selectedCity;
    const zoneMatch = selectedZone === "all" || claim.zone === selectedZone;
    return cityMatch && zoneMatch;
  });
  const filteredQueueIncidents = useMemo(
    () => groupClaimsByIncident(filteredQueueClaims, { bucketMinutes: 90 }),
    [filteredQueueClaims],
  );
  const topIncident = filteredQueueIncidents[0] || null;
  const integrityPreview = (analytics?.duplicate_claim_log || [])
    .filter((entry) => selectedZone === "all" || entry.details?.zone === selectedZone)
    .slice(0, 4);
  const forecastEntries = (analytics?.next_week_forecast || []).filter(
    (entry) => selectedCity === "all" || entry.city === selectedCity,
  );

  if (loading) {
    return <div className="panel p-8 text-center text-ink/60">Loading admin panel...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Admin controls</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-primary">System Oversight</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant">
            Operational monitoring for RideShield incidents, review pressure, payout movement, and scheduler heartbeat.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="field min-w-44 !rounded-full !bg-surface-container-low !py-2"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedZone("all");
            }}
          >
            <option value="all">All cities</option>
            {cityOptions.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.display_name}
              </option>
            ))}
          </select>
          <select
            className="field min-w-44 !rounded-full !bg-surface-container-low !py-2"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            <option value="all">All zones</option>
            {zoneOptions.map((zone) => (
              <option key={zone} value={zone}>
                {humanizeSlug(zone)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2">
          <KpiTile label="Claims" value={claimStats?.total_claims ?? 0} hint={`Approval ${formatPercent(claimStats?.approval_rate)}`} />
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2">
          <KpiTile label="Approval" value={formatPercent(claimStats?.approval_rate)} hint={`Delayed ${formatPercent(claimStats?.delayed_rate)}`} />
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2">
          <KpiTile label="Delayed" value={claimStats?.delayed ?? 0} hint={`${queue?.overdue_count ?? 0} overdue`} />
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2">
          <KpiTile label="Fraud rate" value={formatPercent(claimStats?.fraud_rate)} hint="Detection window" />
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2">
          <KpiTile label="Payout vol." value={formatCurrency(payoutStats?.total_amount)} hint={`${payoutStats?.total_payouts ?? 0} transfers`} />
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-2">
          <KpiTile label="Health" value="99.98%" hint="Pipeline stable" accent="dark" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
        <section className="space-y-6">
          <div className="grid items-start gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <ReviewQueue claims={filteredQueueClaims} resolvingId={resolvingId} onResolve={handleResolve} />
            <div className="space-y-6">
              <NextDecisionPanel incident={topIncident} />

              <div className="context-panel p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Clock3 size={18} className="text-primary" />
                  <h3 className="text-lg font-bold text-primary">System Scheduler</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-surface-container-low/80 p-4 border border-primary/10">
                    <p className="text-sm text-on-surface-variant">Status</p>
                    <p className="mt-2 text-lg font-semibold text-primary">
                      {analytics?.scheduler?.enabled ? "Monitoring" : "Disabled"}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-surface-container-low/80 p-4 border border-primary/10">
                    <p className="text-sm text-on-surface-variant">Last run</p>
                    <p className="mt-2 text-lg font-semibold text-primary">
                      {analytics?.scheduler?.last_finished_at ? formatRelative(analytics.scheduler.last_finished_at) : "--"}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-surface-container-low/80 p-4 border border-primary/10">
                    <p className="text-sm text-on-surface-variant">Next run</p>
                    <p className="mt-2 text-lg font-semibold text-primary">
                      {analytics?.scheduler?.next_scheduled_at ? formatRelative(analytics.scheduler.next_scheduled_at) : "--"}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-surface-container-low/80 p-4 border border-primary/10">
                    <p className="text-sm text-on-surface-variant">Interval</p>
                    <p className="mt-2 text-lg font-semibold text-primary">{analytics?.scheduler?.interval_seconds || "--"}s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="passive-panel card-passive p-6">
              <div className="mb-4 flex items-center gap-3">
                <ShieldAlert size={18} className="text-primary" />
                <h3 className="text-lg font-bold text-primary">Integrity preview</h3>
              </div>
              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                {integrityPreview.length ? (
                  integrityPreview.map((entry) => (
                    <div key={entry.id} className="rounded-[18px] border border-primary/8 bg-surface-container-low px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">
                        {entry.action === "duplicate_detected" ? "Duplicate block" : "Extension auth"} - {formatRelative(entry.created_at)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        Zone {humanizeSlug(entry.details?.zone || "system")} -{" "}
                        {(entry.details?.incident_triggers || entry.details?.fired_triggers || [])
                          .map(humanizeSlug)
                          .join(", ") || "No trigger list"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant">No recent duplicate or extension activity.</p>
                )}
              </div>
            </div>

            <div className="context-panel p-6">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle size={18} className="text-primary" />
                <h3 className="text-lg font-bold text-primary">Forecast horizon</h3>
              </div>
              <div className="space-y-3">
                {forecastEntries.map((entry) => (
                  <div key={entry.city} className="rounded-[20px] bg-surface-container-low/80 p-4 border border-amber-200/20">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-primary capitalize">{entry.city}</p>
                      <span className="pill bg-amber-100 text-amber-900 text-xs font-bold">{entry.band}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-lowest">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, entry.projected_risk * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-6 text-on-surface-variant">
                      Base {entry.base_risk.toFixed(2)} - Projected {entry.projected_risk.toFixed(2)} ({entry.active_incidents} active)
                    </p>
                  </div>
                ))}
                {!forecastEntries.length ? (
                  <p className="text-sm text-on-surface-variant">No forecast entries match the current filters.</p>
                ) : null}
              </div>
            </div>
          </div>

          <DisruptionMap events={visibleEvents} city={selectedCity} />

          <div className="context-panel p-6">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-primary">72h-7d Forecast cards</h3>
            </div>
            <ForecastCards city={selectedCity === "all" ? "delhi" : selectedCity} />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="context-panel p-6">
            <div className="mb-5">
              <p className="eyebrow">Model status</p>
              <ModelHealthBadge />
            </div>
          </div>

          <div className="context-panel p-6">
            <div className="mb-5">
              <p className="eyebrow">Operational</p>
              <h3 className="mt-2 text-lg font-bold leading-tight text-primary">Decisions explainable under pressure.</h3>
              <p className="mt-3 text-xs leading-6 text-on-surface-variant">
                Delayed claims, duplicates, and event context stay visible for manual review instead of being buried in
                feed history.
              </p>
            </div>
          </div>

          <EventPanel events={visibleEvents.slice(0, 4)} />
        </aside>
      </div>
    </div>
  );
}

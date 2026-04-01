import { useEffect, useMemo, useState } from "react";
import { Activity, BrainCircuit, Clock3, MapPinned, ShieldAlert, TrendingUp } from "lucide-react";

import { analyticsApi } from "../api/analytics";
import { healthApi } from "../api/health";
import { locationsApi } from "../api/locations";
import SectionHeader from "../components/SectionHeader";
import { formatDateTime, formatPercent, humanizeSlug } from "../utils/formatters";

function interpretLossRatio(value) {
  if (!Number.isFinite(Number(value))) {
    return {
      tone: "bg-surface-container-low text-on-surface",
      label: "Pending",
      message: "Loss ratio is not available yet.",
    };
  }

  const ratio = Number(value);
  if (ratio >= 150) {
    return {
      tone: "bg-red-100 text-red-900",
      label: "Pressure",
      message: "Claims are outpacing current premium volume. Treat this as a pricing or simulation stress signal.",
    };
  }
  if (ratio >= 100) {
    return {
      tone: "bg-amber-100 text-amber-900",
      label: "Watch",
      message: "Claims and payouts are close to or above sustainable weekly pricing. Review premium calibration.",
    };
  }
  return {
    tone: "bg-emerald-100 text-emerald-900",
    label: "Stable",
    message: "Current payouts sit within the protection envelope implied by recent premium volume.",
  };
}

function interpretFraudRate(value) {
  const rate = Number(value || 0);
  if (rate >= 20) {
    return "Elevated suspicious activity. Review rule and model thresholds.";
  }
  if (rate >= 8) {
    return "Moderate fraud pressure. Watch manual review volume and duplicate patterns.";
  }
  return "Low flagged fraud pressure in the current window.";
}

function bandTone(band) {
  switch (band) {
    case "critical":
      return {
        container: "border-l-red-600 bg-red-50/40",
        pill: "bg-red-100 text-red-900",
        progress: "bg-red-600",
      };
    case "elevated":
      return {
        container: "border-l-amber-600 bg-amber-50/40",
        pill: "bg-amber-100 text-amber-900",
        progress: "bg-amber-600",
      };
    case "guarded":
      return {
        container: "border-l-blue-600 bg-blue-50/40",
        pill: "bg-blue-100 text-blue-900",
        progress: "bg-blue-600",
      };
    default:
      return {
        container: "border-l-emerald-600 bg-emerald-50/40",
        pill: "bg-emerald-100 text-emerald-900",
        progress: "bg-emerald-600",
      };
  }
}

export default function IntelligenceOverview() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [config, setConfig] = useState(null);
  const [locations, setLocations] = useState(null);

  useEffect(() => {
    document.title = "System Intelligence | RideShield";
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [analyticsRes, configRes, locationsRes] = await Promise.all([
          analyticsApi.adminOverview({ days: 14 }),
          healthApi.getConfig(),
          locationsApi.config(),
        ]);
        setAnalytics(analyticsRes.data);
        setConfig(configRes.data);
        setLocations(locationsRes.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="panel p-8 text-center text-ink/60">Loading intelligence overview...</div>;
  }

  const scheduler = config?.scheduler;
  const lossRatio = interpretLossRatio(analytics?.loss_ratio);
  const fraudMeaning = interpretFraudRate(analytics?.fraud_rate);
  const citiesMonitored = (locations?.cities || []).length;
  const forecastReadings = analytics?.next_week_forecast || [];
  const topForecast = useMemo(
    () =>
      [...forecastReadings].sort((a, b) => Number(b.projected_risk || 0) - Number(a.projected_risk || 0))[0] || null,
    [forecastReadings],
  );

  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="hero-glow hero-mesh rounded-[36px] p-8 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">System intelligence</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            The logic layer behind RideShield, exposed as a readable product surface.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            This page should not just show numbers. It should interpret what the engine is seeing, which city is moving
            toward pressure, and whether the current payout profile still makes sense.
          </p>
        </div>

        <div className="space-y-4">
          <div className="panel p-6">
            <p className="eyebrow">Scheduler state</p>
            <p className="mt-3 text-2xl font-bold text-primary">{scheduler?.enabled ? "Monitoring active" : "Monitoring disabled"}</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Interval {scheduler?.interval_seconds || "--"}s - last finished{" "}
              {scheduler?.last_finished_at ? formatDateTime(scheduler.last_finished_at) : "--"} - next scheduled{" "}
              {scheduler?.next_scheduled_at ? formatDateTime(scheduler.next_scheduled_at) : "--"}
            </p>
          </div>
          <div className="panel-quiet p-6">
            <p className="text-sm text-on-surface-variant">Primary interpretation</p>
            <p className="mt-2 text-lg font-semibold text-primary">
              {topForecast
                ? `${humanizeSlug(topForecast.city)} is the highest near-term pressure city.`
                : "No forecast lead city available right now."}
            </p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {topForecast
                ? `Projected risk is ${topForecast.projected_risk.toFixed(2)} with ${topForecast.active_incidents} active incident(s) already in the system.`
                : "Wait for new forecast data to identify the next operational hotspot."}
            </p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Intelligence blocks"
          title="What the system is reasoning over"
          description="This is an explanation surface, so each block should tell you what the engine watches and why it affects a worker outcome."
        />
        <div className="grid grid-cols-12 gap-5">
          {[
            {
              icon: Activity,
              title: "Trigger signals",
              body: "Rain, heat, AQI, traffic, platform outage, and social disruption signals are evaluated against zone thresholds before an incident exists.",
              span: "col-span-12 md:col-span-6",
            },
            {
              icon: MapPinned,
              title: "Zone awareness",
              body: "Cities and zones are DB-backed so monitoring, claim eligibility, and forecasting all reference the same geography truth.",
              span: "col-span-12 md:col-span-6",
            },
            {
              icon: ShieldAlert,
              title: "Fraud and trust",
              body: "Fraud score, trust score, and decision breakdown combine to reduce false positives and explain why some claims move to review.",
              span: "col-span-12 lg:col-span-6",
            },
            {
              icon: BrainCircuit,
              title: "Decision output",
              body: "Each worker gets one claim per incident window, with approval, delay, or rejection exposed as a readable path rather than a black-box result.",
              span: "col-span-12 lg:col-span-6",
            },
          ].map(({ icon: Icon, title, body, span }) => (
            <div key={title} className={`${span} context-panel p-8`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-surface-container-low text-primary transition-smooth hover:scale-110">
                <Icon size={26} />
              </div>
              <h3 className="mt-6 text-xl font-bold leading-tight text-primary">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-on-surface-variant">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Current readings"
          title="Current system-level indicators"
          description="A metric should not appear here unless the page can explain what it means."
        />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 p-6 decision-panel lg:col-span-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Loss ratio</p>
                <p className="mt-4 text-5xl font-bold text-primary">{formatPercent(analytics?.loss_ratio, 1)}</p>
              </div>
              <span className={`pill ${lossRatio.tone}`}>{lossRatio.label}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">{lossRatio.message}</p>
          </div>
          <div className="col-span-12 p-6 context-panel md:col-span-4">
            <p className="eyebrow">Fraud rate</p>
            <p className="mt-4 text-4xl font-bold text-primary">{formatPercent(analytics?.fraud_rate, 1)}</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{fraudMeaning}</p>
          </div>
          <div className="col-span-12 p-6 context-panel md:col-span-4">
            <p className="eyebrow">Cities monitored</p>
            <p className="mt-4 text-4xl font-bold text-primary">{citiesMonitored}</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {(locations?.cities || []).map((city) => city.display_name).join(", ")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-12 context-panel p-6 lg:col-span-7">
            <div className="mb-4 flex items-center gap-3">
              <TrendingUp size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-primary">Forecast bands</h3>
            </div>
            <div className="space-y-3">
              {forecastReadings.map((entry) => {
                const tone = bandTone(entry.band);

                return (
                  <div key={entry.city} className={`rounded-[20px] border-l-4 p-5 transition-smooth hover:shadow-md ${tone.container}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-semibold capitalize text-on-surface">{humanizeSlug(entry.city)}</p>
                      <span className={`pill text-xs font-bold capitalize ${tone.pill}`}>
                        {entry.band}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className={`h-full rounded-full transition-all ${tone.progress}`}
                        style={{ width: `${Math.min(100, entry.projected_risk * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Base {entry.base_risk.toFixed(2)} - Projected {entry.projected_risk.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 context-panel p-6 lg:col-span-5">
            <div className="mb-4 flex items-center gap-3">
              <Clock3 size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-primary">Interpretation notes</h3>
            </div>
            <div className="space-y-4 text-sm leading-7 text-on-surface-variant">
              <p>Trigger evaluation is rule-based today and intentionally explainable.</p>
              <p>Claims are incident-based, not trigger-stacked, so overlapping same-window events do not multiply payouts for one worker.</p>
              <p>Location awareness is DB-backed, which keeps monitoring, claim logic, and future analytics tied to the same geography source of truth.</p>
              <p>Extreme ratios on this page should be read as demo pressure signals unless the business model has been recalibrated against real premium volume.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

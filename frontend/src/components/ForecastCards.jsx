import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { analyticsApi } from "../api/analytics";
import { humanizeSlug } from "../utils/formatters";

export default function ForecastCards({ city = "delhi" }) {
  const [forecasts, setForecasts] = useState({ h24: null, d3: null, d7: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadForecasts = async () => {
      try {
        setLoading(true);

        const [f24, f72, f168] = await Promise.all([
          analyticsApi.forecast({ city, horizon: 24 }),
          analyticsApi.forecast({ city, horizon: 72 }),
          analyticsApi.forecast({ city, horizon: 168 }),
        ]);

        setForecasts({
          h24: f24.data?.forecast,
          d3: f72.data?.forecast,
          d7: f168.data?.forecast,
        });
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load forecasts");
        console.error("Forecast load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadForecasts();
  }, [city]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="panel h-32 animate-pulse bg-surface-container-low" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[22px] border border-error bg-error/10 p-4">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  const buildCard = (label, forecast) => {
    if (!forecast) {
      return (
        <div
          key={label}
          className="rounded-[20px] bg-surface-container-low p-4"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">{label}</p>
          <p className="mt-3 text-on-surface-variant">No data</p>
        </div>
      );
    }

    const disruption_score = forecast.disruption_score || 0;
    const risk_band = forecast.risk_band || "low";

    const bandColor = {
      low: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
      guarded: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
      elevated: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" },
      critical: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
    }[risk_band] || { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500" };

    const topTriggers = forecast.likely_triggers || [];

    return (
      <div
        key={label}
        className="rounded-[20px] border border-surface-variant bg-surface-container-low p-4"
      >
        <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">{label}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">
              {(disruption_score * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-on-surface-variant">Disruption risk</p>
          </div>
          <span className={`pill ${bandColor.bg} ${bandColor.text} text-[10px]`}>
            <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${bandColor.dot}`} />
            {risk_band}
          </span>
        </div>

        {topTriggers.length > 0 && (
          <div className="mt-4 text-xs">
            <p className="text-on-surface-variant">Likely triggers:</p>
            <div className="mt-2 space-y-1">
              {topTriggers.slice(0, 2).map((trigger) => (
                <div key={trigger} className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-primary" />
                  <span className="text-on-surface">{humanizeSlug(trigger)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {buildCard("24h", forecasts.h24)}
      {buildCard("3d", forecasts.d3)}
      {buildCard("7d", forecasts.d7)}
    </div>
  );
}

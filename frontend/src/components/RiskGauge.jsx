import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { formatScore, humanizeSlug, riskLabel } from "../utils/formatters";

function riskBand(score) {
  const numeric = Number(score || 0);

  if (numeric < 0.25) {
    return {
      label: "Low risk",
      summary:
        "Conditions look stable. A lighter plan may be enough unless this rider wants more coverage.",
    };
  }

  if (numeric < 0.6) {
    return {
      label: "Medium risk",
      summary:
        "Some disruption pressure is showing up. Smart-level cover is usually the safest default.",
    };
  }

  return {
    label: "High risk",
    summary:
      "This rider is more exposed to trigger events, so broader coverage is worth comparing.",
  };
}

export default function RiskGauge({ score, breakdown }) {
  const [showDetails, setShowDetails] = useState(false);
  const meta = riskLabel(score);
  const items = Object.entries(breakdown || {}).filter(
    ([key]) => typeof breakdown[key] === "number",
  );
  const band = riskBand(score);

  if (score === null || score === undefined) {
    return (
      <div className="panel overflow-hidden p-6">
        <div className="rounded-2xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
          <AlertTriangle className="mb-2" size={18} />
          Complete registration to see the rider&apos;s risk score and suggested
          protection level.
        </div>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">
            Risk snapshot
          </p>
          <h3 className="mt-1 text-2xl font-bold">
            How exposed is this rider?
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant">
            {band.summary}
          </p>
        </div>
        <div
          className={`rounded-3xl px-4 py-3 ${meta.tone} bg-current/10 text-right`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">
            {band.label}
          </p>
          <p className="mt-2 text-3xl font-bold">{formatScore(score)}</p>
          <p className="text-sm">{meta.label}</p>
        </div>
      </div>

      {items.length ? (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="pill bg-surface-container-high text-on-surface-variant transition hover:bg-surface-container-highest"
              onClick={() => setShowDetails((current) => !current)}
            >
              {showDetails ? "Hide details" : "View details"}
            </button>
            <p className="text-sm text-on-surface-variant">
              Premiums already reflect city, season, and zone conditions.
            </p>
          </div>

          {showDetails ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {items.map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-surface-container-high p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                    {humanizeSlug(key)}
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {formatScore(value)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-surface-container-high p-4 text-sm leading-6 text-on-surface-variant">
              Only the final risk score matters for plan selection. Open the
              details if you need the factor-level math.
            </div>
          )}
        </>
      ) : (
        <div className="mt-5 rounded-2xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
          <AlertTriangle className="mb-2" size={18} />
          Detailed factor breakdown will appear after registration.
        </div>
      )}
    </div>
  );
}

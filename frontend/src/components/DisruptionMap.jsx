import { humanizeSlug } from "../utils/formatters";

const ZONE_COORDS = {
  south_delhi: { top: "62%", left: "42%", label: "mt-3" },
  north_delhi: { top: "18%", left: "48%", label: "mt-3" },
  east_delhi: { top: "44%", left: "72%", label: "mt-3" },
  west_delhi: { top: "42%", left: "18%", label: "mt-8 -translate-x-10 text-left" },
  central_delhi: { top: "40%", left: "46%", label: "mt-3" },
  south_mumbai: { top: "78%", left: "36%", label: "mt-3" },
  western_suburbs: { top: "42%", left: "22%", label: "-mt-6 -translate-x-10 text-left" },
  eastern_suburbs: { top: "46%", left: "64%", label: "mt-6 translate-x-7 text-left" },
  navi_mumbai: { top: "28%", left: "78%", label: "-mt-2 translate-x-7 text-left" },
  koramangala: { top: "62%", left: "46%", label: "mt-3" },
  whitefield: { top: "32%", left: "76%", label: "mt-3 translate-x-6 text-left" },
  indiranagar: { top: "42%", left: "58%", label: "mt-3 translate-x-4 text-left" },
  jayanagar: { top: "70%", left: "40%", label: "mt-3 -translate-x-4 text-left" },
  electronic_city: { top: "84%", left: "52%", label: "mt-3" },
  t_nagar: { top: "50%", left: "40%", label: "mt-3 -translate-x-4 text-left" },
  anna_nagar: { top: "28%", left: "44%", label: "mt-3" },
  adyar: { top: "68%", left: "64%", label: "mt-3 translate-x-4 text-left" },
  velachery: { top: "72%", left: "52%", label: "mt-3 translate-x-6 text-left" },
};

function intensityClass(score) {
  if (score >= 0.75) {
    return "bg-rose-500";
  }
  if (score >= 0.5) {
    return "bg-orange-400";
  }
  if (score >= 0.25) {
    return "bg-gold";
  }
  return "bg-storm";
}

export default function DisruptionMap({ events = [], city = "delhi" }) {
  const zoneSummary = Object.values(
    events.reduce((acc, event) => {
      const current = acc[event.zone] || {
        zone: event.zone,
        count: 0,
        severity: 0,
        triggers: new Set(),
      };
      current.count += 1;
      current.severity = Math.max(current.severity, Number(event.severity || 0));
      const triggers = event.metadata_json?.fired_triggers || [event.event_type];
      triggers.forEach((trigger) => current.triggers.add(trigger));
      acc[event.zone] = current;
      return acc;
    }, {}),
  ).map((item) => ({
    ...item,
    triggers: Array.from(item.triggers),
  }));

  return (
    <div className="panel p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">Disruption map</p>
        <h3 className="mt-1 text-2xl font-bold">
          Zone heat view for {city === "all" ? "all monitored cities" : humanizeSlug(city)}
        </h3>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="relative min-h-72 overflow-hidden rounded-[2rem] p-4" style={{ background: "linear-gradient(180deg, #131b2e 0%, #0b1326 100%)" }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(70,220,205,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(70,220,205,0.08) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="absolute inset-6 rounded-[1.75rem]" style={{ border: "1px solid rgba(69,70,79,0.2)" }} />
          <div className="absolute inset-[18%] rounded-[1.75rem]" style={{ background: "radial-gradient(circle at 25% 30%, rgba(70,220,205,0.05), transparent 18%), radial-gradient(circle at 70% 62%, rgba(202,190,255,0.04), transparent 16%)" }} />
          {zoneSummary.length ? (
            zoneSummary.map((zone) => {
              const coord = ZONE_COORDS[zone.zone] || { top: "50%", left: "50%", label: "mt-3" };
              return (
                <div
                  key={zone.zone}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{ top: coord.top, left: coord.left }}
                >
                  <div className={`mx-auto h-4 w-4 rounded-full ring-4 ring-white/70 shadow-[0_0_0_10px_rgba(255,255,255,0.12)] ${intensityClass(zone.severity)}`} />
                  <div className={coord.label}>
                    <p className="text-xs font-semibold leading-tight text-on-surface">{humanizeSlug(zone.zone)}</p>
                    <p className="text-[11px] text-on-surface-variant">{zone.count} incidents</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">No current disruptions to map.</div>
          )}
        </div>
        <div className="space-y-3">
          {zoneSummary.length ? (
            zoneSummary.map((zone) => (
              <div key={zone.zone} className="rounded-2xl bg-surface-container-high p-4" style={{ border: "1px solid rgba(69,70,79,0.15)" }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-on-surface">{humanizeSlug(zone.zone)}</p>
                  <span className={`pill text-white ${intensityClass(zone.severity)}`}>Severity {zone.severity.toFixed(2)}</span>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">{zone.triggers.map(humanizeSlug).join(", ")}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant">No disruption evidence available in the current time window.</p>
          )}
        </div>
      </div>
    </div>
  );
}

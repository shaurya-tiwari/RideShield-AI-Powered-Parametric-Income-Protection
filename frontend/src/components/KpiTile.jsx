/**
 * KPI tile for the Admin Panel overview row.
 *
 * Extracted from AdminPanel.jsx so the page file focuses on data
 * orchestration. Supports three accent variants that align with the
 * RideShield design system surface hierarchy.
 *
 * @param {{ label: string, value: string|number, hint: string, accent?: "default"|"soft"|"dark" }} props
 */
export default function KpiTile({ label, value, hint, accent = "default" }) {
  const accentClass = {
    default: "bg-surface-container-lowest",
    soft: "bg-surface-container-low",
    dark: "bg-[radial-gradient(circle_at_top_right,_rgba(133,189,188,0.16),_transparent_30%),linear-gradient(135deg,#003535_0%,#0d4d4d_100%)] text-on-primary",
  }[accent];

  return (
    <div
      className={`rounded-[22px] border border-outline-variant/40 p-5 shadow-[0_12px_30px_rgba(26,28,25,0.05)] transition-smooth card-hover ${accentClass}`}
    >
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

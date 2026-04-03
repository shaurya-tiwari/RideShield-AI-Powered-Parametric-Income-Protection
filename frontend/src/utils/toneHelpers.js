/**
 * Returns Tailwind class strings for disruption-level styling.
 *
 * Used in Dashboard nearbyAlerts, AdminPanel forecast rows, and any
 * component that needs colour-coded severity indicators.
 *
 * @param {number} level - disruption_score value between 0 and 1
 * @returns {{ border: string, progress: string, pill: string }}
 */
export function getDisruptionTone(level) {
  if (level >= 0.7) {
    return {
      border:   "border-l-red-500 bg-error/10",
      progress: "bg-red-500",
      pill:     "badge-error",
    };
  }
  if (level >= 0.4) {
    return {
      border:   "border-l-amber-500 bg-on-tertiary-container/10",
      progress: "bg-amber-500",
      pill:     "badge-pending",
    };
  }
  return {
    border:   "border-l-primary bg-primary/10",
    progress: "bg-primary",
    pill:     "badge-active",
  };
}

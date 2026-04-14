/**
 * Local-First Observability Logger
 * 
 * Captures structured error payloads for UX telemetry.
 * Currently uses console metrics to avoid premature vendor lock-in.
 * 
 * Drop-in replacement ready for Sentry, PostHog, or Datadog in the future.
 */

export function logError({ code, route, isDuplicate, severity }) {
  const payload = {
    code,
    route,
    isDuplicate,
    severity,
    ts: Date.now(),
  };

  // Skip spamming the logs with debounced redundant errors
  if (isDuplicate) return;

  // Use structure for clean dashboard observability simulation
  console.groupCollapsed(`[Observability] Error Context: ${code}`);
  console.table(payload);
  console.groupEnd();
}

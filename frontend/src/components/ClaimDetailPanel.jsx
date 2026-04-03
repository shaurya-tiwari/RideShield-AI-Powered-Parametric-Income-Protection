import { formatCurrency, formatDateTime, formatScore, humanizeSlug, statusPill } from "../utils/formatters";

function renderTriggerList(triggers = []) {
  if (!triggers.length) {
    return "None";
  }
  return triggers.map(humanizeSlug).join(", ");
}

export default function ClaimDetailPanel({ claim }) {
  if (!claim) {
    return (
      <div className="context-panel p-6">
        <div className="mb-5">
          <p className="eyebrow">Claim detail</p>
          <h3 className="mt-2 text-2xl font-bold text-primary">Select an incident</h3>
        </div>
        <p className="text-sm leading-6 text-on-surface-variant">
          Pick a claim incident from the worker feed to inspect why it was approved, delayed, or rejected.
        </p>
      </div>
    );
  }

  const breakdown = claim.decision_breakdown || {};
  const inputs = breakdown.inputs || {};
  const components = breakdown.breakdown || {};
  const payoutBreakdown = claim.payout_breakdown || breakdown.payout_breakdown || {};
  const fraudModel = claim.fraud_model || breakdown.fraud_model || {};
  const incidentTriggers = inputs.incident_triggers || claim.decision_breakdown?.incident_triggers || [claim.trigger_type];
  const coveredTriggers = inputs.covered_triggers || claim.decision_breakdown?.covered_triggers || [];

  return (
    <div className="context-panel p-6">
      <div className="mb-5">
        <p className="eyebrow">Claim detail</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className={statusPill(claim.status)}>{humanizeSlug(claim.status)}</span>
          <h3 className="text-2xl font-bold text-primary">{renderTriggerList(incidentTriggers)}</h3>
        </div>
        <p className="mt-2 text-sm text-on-surface-variant">{formatDateTime(claim.created_at)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel-quiet rounded-[24px] p-4">
          <p className="text-sm text-on-surface-variant">Decision explanation</p>
          <p className="mt-3 text-sm leading-7 text-on-surface">
            {breakdown.explanation || claim.rejection_reason || "No explanation available."}
          </p>
        </div>
        <div className="panel-quiet rounded-[24px] p-4">
          <p className="text-sm text-on-surface-variant">Payout impact</p>
          <p className="mt-3 text-lg font-semibold text-primary">
            {formatCurrency(claim.final_payout || claim.calculated_payout)}
          </p>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            Hours affected: {claim.disruption_hours ?? "--"} - Peak multiplier: {claim.peak_multiplier ?? "--"}
          </p>
          {payoutBreakdown.net_income_per_hour ? (
            <div className="mt-4 space-y-1 text-sm leading-6 text-on-surface-variant">
              <p>Gross hourly reference: {formatCurrency(payoutBreakdown.income_per_hour)}</p>
              <p>Net protected hourly: {formatCurrency(payoutBreakdown.net_income_per_hour)}</p>
              <p>
                Operating-cost factor: {Math.round(Number(payoutBreakdown.operating_cost_factor || 0) * 100)}%
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-on-surface-variant">Final score</p>
          <p className="mt-2 font-semibold text-primary">{formatScore(claim.final_score)}</p>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant">Fraud score</p>
          <p className="mt-2 font-semibold text-primary">{formatScore(claim.fraud_score)}</p>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant">Event confidence</p>
          <p className="mt-2 font-semibold text-primary">{formatScore(claim.event_confidence)}</p>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant">Trust score</p>
          <p className="mt-2 font-semibold text-primary">{formatScore(claim.trust_score)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="panel-quiet rounded-[24px] p-4">
          <p className="text-sm text-on-surface-variant">Fraud model signal</p>
          <p className="mt-2 text-lg font-semibold text-primary">
            {fraudModel.fraud_probability !== undefined
              ? `${Math.round(Number(fraudModel.fraud_probability || 0) * 100)}% suspicious`
              : "Rule-only decision"}
          </p>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            {fraudModel.model_version || "rule-based"} {fraudModel.fallback_used ? "- fallback active" : "- hybrid scoring active"}
          </p>
          {Array.isArray(fraudModel.top_factors) && fraudModel.top_factors.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {fraudModel.top_factors.slice(0, 4).map((factor) => (
                <span key={factor.factor || factor.label} className="pill" style={{ background: "rgba(120,53,0,0.3)", color: "#f4a135" }}>
                  {factor.label || humanizeSlug(factor.factor)}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">No elevated fraud factors on this claim.</p>
          )}
        </div>
        <div className="panel-quiet rounded-[24px] p-4">
          <p className="text-sm text-on-surface-variant">Worker explanation</p>
          <p className="mt-2 text-sm leading-7 text-on-surface">
            {claim.status === "approved"
              ? "This payout protects lost net earning capacity, not gross billing. Avoided trip costs are removed before the final amount is credited."
              : claim.status === "delayed"
                ? "This incident matched policy coverage, but the review path stayed open because fraud or confidence signals were not clean enough for zero-touch approval."
                : "The claim was stopped because the combined disruption, confidence, trust, or fraud signals did not support a payout."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="panel-quiet rounded-[24px] p-4">
          <p className="text-sm text-on-surface-variant">Incident triggers</p>
          <p className="mt-2 text-sm leading-7 text-on-surface">{renderTriggerList(incidentTriggers)}</p>
          <p className="mt-3 text-sm text-on-surface-variant">Covered by policy</p>
          <p className="mt-2 text-sm leading-7 text-on-surface">{renderTriggerList(coveredTriggers)}</p>
        </div>
        <div className="panel-quiet rounded-[24px] p-4">
          <p className="text-sm text-on-surface-variant">Score breakdown</p>
          <div className="mt-2 grid gap-2 text-sm text-on-surface">
            <p>Disruption component: {formatScore(components.disruption_component)}</p>
            <p>Confidence component: {formatScore(components.confidence_component)}</p>
            <p>Fraud component: {formatScore(components.fraud_component)}</p>
            <p>Trust component: {formatScore(components.trust_component)}</p>
            <p>Flag penalty: {formatScore(components.flag_penalty)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

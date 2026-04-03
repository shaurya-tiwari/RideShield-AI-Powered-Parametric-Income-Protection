import { humanizeSlug, statusPill } from "../utils/formatters";

/**
 * Worker-facing decision panel — shows the most relevant claim context,
 * the confidence score, and a plain-English explanation of the decision.
 *
 * Extracted from Dashboard.jsx to make it independently importable and testable.
 *
 * @param {{ claim: object|null, narrative: string }} props
 */
export default function DecisionPanel({ claim, narrative }) {
  const decisionState = claim?.status || "idle";
  const score =
    Number.isFinite(Number(claim?.final_score)) && Number(claim?.final_score) > 0
      ? `${Math.round(Number(claim.final_score) * 100)}% confidence`
      : "No active score";

  let heading = "No active claim needs attention right now.";
  let reason =
    "RideShield is monitoring your zone and will create a claim automatically if a covered incident is verified.";

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
        <span className="pill bg-primary/10 text-primary">{score}</span>
        {claim?.id ? <span className="pill bg-white text-on-surface-variant">Claim {claim.id.slice(0, 6)}</span> : null}
      </div>

      <div className="mt-5 rounded-[22px] bg-white/75 p-4">
        <p className="text-sm font-semibold text-primary">Why this matters now</p>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">{reason}</p>
      </div>

      <div className="mt-5 rounded-[22px] border border-primary/10 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-primary">Protection narrative</p>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">{narrative}</p>
      </div>
    </div>
  );
}

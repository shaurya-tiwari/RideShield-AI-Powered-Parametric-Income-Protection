import clsx from "clsx";

import {
  formatCurrency,
  humanizeSlug,
  weeklyToDaily,
} from "../utils/formatters";

export default function PlanCard({
  plan,
  selected,
  onSelect,
  story,
  recommendationReason,
}) {
  const planName = plan.display_name || humanizeSlug(plan.plan_name);
  const triggers = (plan.triggers_covered || []).map(humanizeSlug);
  const dailyEquivalent = weeklyToDaily(plan.weekly_premium);

  return (
    <button
      type="button"
      onClick={() => onSelect(plan.plan_name)}
      className={clsx(
        "panel w-full p-5 text-left transition hover:-translate-y-0.5",
        selected ? "ring-2 ring-primary/30" : "",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-on-surface-variant">
            {story?.eyebrow || humanizeSlug(plan.plan_name)}
          </p>
          <h3 className="mt-1 text-2xl font-bold">{planName}</h3>
        </div>
        {plan.is_recommended ? (
          <span className="pill" style={{ background: "rgba(120,53,0,0.3)", color: "#f4a135" }}>Recommended</span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-on-surface-variant">
        {story?.bestFor || plan.description}
      </p>

      {plan.is_recommended && recommendationReason ? (
        <div className="mt-4 rounded-2xl p-3 text-sm font-medium" style={{ background: "rgba(0,53,48,0.3)", color: "#69f8e9" }}>
          {recommendationReason}
        </div>
      ) : null}

      <div className="mt-5 flex items-end gap-2">
        <p className="text-4xl font-bold">
          {formatCurrency(plan.weekly_premium)}
        </p>
        <p className="pb-1 text-sm text-on-surface-variant">per week</p>
      </div>

      <p className="mt-1 text-sm text-on-surface-variant">
        About {formatCurrency(dailyEquivalent)} a day.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface-container-high p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Coverage cap
          </p>
          <p className="mt-2 text-xl font-semibold">
            {formatCurrency(plan.coverage_cap)}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-container-high p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Best for
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">
            {story?.compareFit || plan.description}
          </p>
        </div>
      </div>

      {triggers.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {triggers.map((trigger) => (
            <span key={trigger} className="pill bg-surface-container-high text-on-surface-variant">
              {trigger}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <span
          className={clsx(
            "text-sm font-semibold",
            selected ? "text-secondary" : "text-on-surface-variant",
          )}
        >
          {selected ? "Selected" : "Choose plan"}
        </span>
        <span className="text-sm text-on-surface-variant">
          {triggers.length} trigger{triggers.length === 1 ? "" : "s"} covered
        </span>
      </div>
    </button>
  );
}

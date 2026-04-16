export default function SectionHeader({ eyebrow, title, description, action, invert = false }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.28em] ${invert ? "text-white/60" : "eyebrow"}`}>
            {eyebrow}
          </p>
        )}
        <h2
          className="text-3xl font-bold leading-tight sm:text-4xl"
          style={invert ? { color: "#ffffff" } : { color: "var(--rs-text-primary)" }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="mt-3 max-w-2xl text-sm leading-7 sm:text-base"
            style={invert ? { color: "rgba(255,255,255,0.75)" } : { color: "var(--rs-text-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

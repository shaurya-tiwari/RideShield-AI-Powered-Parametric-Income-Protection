/**
 * Causality Flow diagram — visualises the 4-step RideShield automation
 * pipeline as circular icon nodes connected by a horizontal gradient line.
 *
 * Extracted from DemoRunner.jsx. The steps array is passed as props; icons
 * are lucide-react components so no fake data is introduced.
 *
 * @param {{ steps: Array<{ icon: React.ComponentType, label: string, text: string }> }} props
 */
export default function CausalityFlow({ steps = [] }) {
  return (
    <div className="context-panel p-6">
      <div className="relative grid gap-6 md:grid-cols-4">
        {/* Horizontal gradient connector line — purely decorative */}
        <div
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-8 hidden h-1 rounded-full bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 md:block"
        />

        {steps.map(({ icon: Icon, label, text }) => (
          <div key={label} className="relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="group flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-[0_10px_25px_rgba(26,28,25,0.12)] transition-smooth hover:shadow-[0_15px_35px_rgba(26,28,25,0.18)] hover:scale-110">
                <Icon size={24} />
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">{label}</p>
              <p className="mt-2 text-sm font-semibold leading-tight text-primary">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm leading-7 text-on-surface-variant">
        The scenario button does not create claims directly. It changes the environment, then the actual RideShield
        engine applies thresholds, merges incidents, scores claims, and decides payouts.
      </p>
    </div>
  );
}

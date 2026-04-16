/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        /* ── Semantic surface tokens (set via CSS vars in index.css) ── */
        bg:        "var(--rs-bg)",
        surface:   "var(--rs-surface)",
        elevated:  "var(--rs-elevated)",
        border:    "var(--rs-border)",

        /* ── Semantic text tokens ── */
        "text-primary":   "var(--rs-text-primary)",
        "text-secondary": "var(--rs-text-secondary)",

        /* ── Accent ── */
        accent:          "var(--rs-accent)",
        "accent-muted":  "var(--rs-accent-muted)",
        "on-accent":     "var(--rs-on-accent)",

        /* ── Legacy tokens kept for backward compat ── */
        "surface-dim":               "rgb(var(--color-surface-dim) / <alpha-value>)",
        "surface-bright":            "rgb(var(--color-surface-bright) / <alpha-value>)",
        "surface-container-lowest":  "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        "surface-container-low":     "rgb(var(--color-surface-container-low) / <alpha-value>)",
        "surface-container":         "rgb(var(--color-surface-container) / <alpha-value>)",
        "surface-container-high":    "rgb(var(--color-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--color-surface-container-highest) / <alpha-value>)",
        "surface-variant":           "rgb(var(--color-surface-variant) / <alpha-value>)",
        "on-surface":                "var(--rs-text-primary)",
        "on-surface-variant":        "var(--rs-text-secondary)",
        "on-background":             "var(--rs-text-primary)",
        background:                  "var(--rs-bg)",
        ink:                         "var(--rs-text-primary)",
        mist:                        "var(--rs-bg)",
        outline:                     "var(--rs-border)",
        "outline-variant":           "var(--rs-border)",

        /* ── Primary (accent alias for legacy components) ── */
        primary:            "var(--rs-accent)",
        "primary-container":"var(--rs-accent-muted)",
        "on-primary":       "var(--rs-on-accent)",

        /* ── Secondary / Tertiary (stable for badges etc.) ── */
        secondary:               "#8b5cf6",
        "secondary-container":   "#2e1065",
        "on-secondary":          "#ffffff",
        tertiary:                "#3b82f6",
        "tertiary-container":    "#1e3a8a",
        "on-tertiary":           "#ffffff",

        error:            "#ef4444",
        "error-container":"#450a0a",
        "on-error":       "#ffffff",

        "inverse-surface":    "rgb(var(--color-inverse-surface) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--color-inverse-on-surface) / <alpha-value>)",
        "inverse-primary":    "#15803d",

        gold: "#f59e0b",
      },

      boxShadow: {
        /* Light mode shadows — depth via shadow, no glow */
        "card-light":  "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover-light": "0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)",
        "panel-light": "0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)",
        "input-light": "0 1px 2px rgba(0,0,0,0.04) inset",
        "focus-light": "0 0 0 3px rgba(22, 163, 74, 0.15)",

        /* Dark mode shadows — depth + glow */
        "card-dark":       "0 4px 24px rgba(0,0,0,0.5)",
        "card-hover-dark": "0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(34,197,94,0.06)",
        "panel-dark":      "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        "glow-green":      "0 0 30px rgba(34,197,94,0.2)",
        "glow-green-sm":   "0 0 12px rgba(34,197,94,0.15)",
        "focus-dark":      "0 0 0 3px rgba(34,197,94,0.25)",

        /* Legacy */
        panel:         "var(--shadow-panel)",
        "ambient-glow":"var(--shadow-ambient)",
        "card-hover":  "var(--shadow-card-hover)",
        "glass-inset": "inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-ring":  "0 0 0 1px rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.3)",
        "glow-cyan":   "0 0 24px rgba(34,197,94,0.25)",
      },

      backgroundImage: {
        "mesh-depth":    "var(--bg-mesh-depth)",
        "hero-gradient": "var(--bg-hero-gradient)",
        /* Light mode CTA: solid rich green */
        "cta-gradient":  "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
        /* Dark mode CTA: slightly glowing green */
        "cta-gradient-dark": "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        "glass-gradient":     "linear-gradient(110deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      },

      fontFamily: {
        display:  ["Sora", "Inter", "system-ui", "sans-serif"],
        headline: ["Sora", "Inter", "system-ui", "sans-serif"],
        body:     ["Inter", "system-ui", "sans-serif"],
        label:    ["Sora", "Inter", "system-ui", "sans-serif"],
      },

      animation: {
        skeleton:    "skeleton 1.5s ease-in-out infinite",
        aurora:      "aurora 20s ease-in-out infinite alternate",
        float:       "float 6s ease-in-out infinite",
        "float-slightly": "float-slightly 6s ease-in-out infinite",
        "glow-pulse":"glow-pulse 3s ease-in-out infinite alternate",
        "fade-up":   "fade-up 0.5s ease-out both",
        "ping-slow": "ping 2s cubic-bezier(0,0,0.2,1) infinite",
      },

      keyframes: {
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.45" },
        },
        aurora: {
          "0%":   { transform: "translate(0%,0%) scale(1)",    opacity: "0.6" },
          "33%":  { transform: "translate(2%,-2%) scale(1.04)", opacity: "0.8" },
          "66%":  { transform: "translate(-2%,2%) scale(0.96)", opacity: "0.7" },
          "100%": { transform: "translate(0%,0%) scale(1)",    opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        "float-slightly": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-5px)" },
        },
        "glow-pulse": {
          "0%":   { opacity: "0.4" },
          "100%": { opacity: "0.9" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      spacing: { 18: "4.5rem" },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

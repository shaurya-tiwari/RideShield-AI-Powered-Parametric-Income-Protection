/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        /* ── Aegis Nocturne — Stitch Design System tokens ──────────── */
        surface: "#0b1326",
        "surface-dim": "#0b1326",
        "surface-bright": "#31394d",
        "surface-container-lowest": "#060e20",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "surface-container-high": "#222a3d",
        "surface-container-highest": "#2d3449",
        "surface-variant": "#2d3449",
        "surface-tint": "#46dccd",

        primary: "#46dccd",
        "primary-container": "#003530",
        "primary-fixed": "#69f8e9",
        "primary-fixed-dim": "#46dccd",
        "on-primary": "#003733",
        "on-primary-container": "#00a89c",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#00504a",

        secondary: "#cabeff",
        "secondary-container": "#4723be",
        "secondary-fixed": "#e6deff",
        "secondary-fixed-dim": "#cabeff",
        "on-secondary": "#30009a",
        "on-secondary-container": "#b8aaff",
        "on-secondary-fixed": "#1c0062",
        "on-secondary-fixed-variant": "#4723be",

        tertiary: "#b9c3ff",
        "tertiary-container": "#1e2a5e",
        "tertiary-fixed": "#dde1ff",
        "tertiary-fixed-dim": "#b9c3ff",
        "on-tertiary": "#202c60",
        "on-tertiary-container": "#8793cd",
        "on-tertiary-fixed": "#08164b",
        "on-tertiary-fixed-variant": "#384378",

        "on-surface": "#dae2fd",
        "on-surface-variant": "#c6c5d1",
        "on-background": "#dae2fd",
        background: "#0b1326",

        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",

        outline: "#90909a",
        "outline-variant": "#45464f",

        "inverse-surface": "#dae2fd",
        "inverse-on-surface": "#283044",
        "inverse-primary": "#006a62",

        /* ── Semantic aliases ──────────────────────────────────────── */
        ink: "#dae2fd",
        mist: "#0b1326",
        forest: "#46dccd",
        storm: "#cabeff",
        gold: "#f4a135",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(6, 14, 32, 0.35)",
        "ambient-glow": "0 0 40px 0px rgba(202, 190, 255, 0.06)",
        "card-hover": "0 20px 60px rgba(70, 220, 205, 0.08)",
      },
      backgroundImage: {
        "mesh-depth":
          "radial-gradient(circle at top left, rgba(70,220,205,0.06), transparent 30%), radial-gradient(circle at top right, rgba(202,190,255,0.06), transparent 35%), linear-gradient(180deg, #0b1326 0%, #131b2e 100%)",
        "hero-gradient":
          "radial-gradient(circle at top right, rgba(70,220,205,0.18), transparent 32%), linear-gradient(135deg, #003530 0%, #0b1326 100%)",
        "cta-gradient":
          "linear-gradient(135deg, #46dccd 0%, #00a89c 100%)",
      },
      fontFamily: {
        headline: ["Manrope", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Manrope", "Inter", "sans-serif"],
      },
      animation: {
        "icon-scale": "icon-scale 0.3s ease-out forwards",
        skeleton: "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        "icon-scale": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" },
        },
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};

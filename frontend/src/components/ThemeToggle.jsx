import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 ${className}`}
      style={{
        background: "var(--rs-elevated)",
        border: "1px solid var(--rs-border)",
        color: "var(--rs-text-secondary)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      {isDark
        ? <Sun size={16} aria-hidden strokeWidth={2} />
        : <Moon size={16} aria-hidden strokeWidth={2} />
      }
    </button>
  );
}

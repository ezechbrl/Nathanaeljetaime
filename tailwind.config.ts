import type { Config } from "tailwindcss";

// Couleurs définies en variables CSS dans app/globals.css (thème sombre bleu-vert).
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: v("bg"), 2: v("bg-2"), 3: v("bg-3") },
        fg: { DEFAULT: v("fg"), muted: v("fg-muted"), faint: v("fg-faint") },
        line: v("line"),
        accent: { DEFAULT: v("accent"), strong: v("accent-strong"), deep: v("accent-deep"), soft: v("accent-soft") },
        leaf: v("brand-leaf"),
        good: v("good"),
        warn: v("warn"),
        bad: v("bad"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Georgia", "serif"],
      },
      fontSize: {
        display: ["clamp(2.75rem, 1.6rem + 4.2vw, 5.25rem)", { lineHeight: "1.02", letterSpacing: "-0.045em" }],
        h1: ["clamp(2.4rem, 1.5rem + 3.2vw, 4.25rem)", { lineHeight: "1.04", letterSpacing: "-0.04em" }],
        h2: ["clamp(2rem, 1.4rem + 2.2vw, 3.25rem)", { lineHeight: "1.08", letterSpacing: "-0.035em" }],
        h3: ["clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)", { lineHeight: "1.2", letterSpacing: "-0.025em" }],
      },
      borderRadius: { card: "12px", ctl: "9px" },
      transitionTimingFunction: { out: "cubic-bezier(0.22, 1, 0.36, 1)" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        rays: { "0%,100%": { transform: "translateX(-2%) skewX(-8deg)", opacity: ".75" }, "50%": { transform: "translateX(2%) skewX(-4deg)", opacity: "1" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        marquee: "marquee 45s linear infinite",
        rays: "rays 14s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

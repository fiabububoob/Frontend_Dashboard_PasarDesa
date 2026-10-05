import type { Config } from "tailwindcss";
import { DURATION, EASING } from "./lib/motion";

const ms = (n: number) => `${n}ms`;

// ---------------------------------------------------------------------------
// Design tokens for PasarDesa admin.
//
// Palette: hijau segar (kontras teks putih di brand-600 ≥ 4.5:1) dengan netral
// bersih kebiruan tipis. Tampilan sengaja datar: latar putih, kartu hanya
// ber-border tipis (tanpa bayangan), supaya konten yang jadi pusat perhatian.
// Semantic colors (warn/danger/info) get their own ramps so status meaning
// never overlaps with the brand color itself.
// ---------------------------------------------------------------------------
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF8F2",
          100: "#D6EFE0",
          200: "#AEDFC2",
          500: "#27A369",
          600: "#188250",
          700: "#126B42",
          900: "#0C3F28",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F7F8FA",
          sunken: "#F0F2F5",
        },
        ink: {
          900: "#1B1F23",
          700: "#444B53",
          500: "#6B7280",
          400: "#9CA3AF",
          200: "#D8DDE3",
        },
        line: "#E8EBEF",
        warn: { 50: "#FDF3E2", 400: "#E3A33D", 600: "#B4700C" },
        danger: { 50: "#FBEAE6", 600: "#B23B24", 700: "#9A3020", 800: "#7E2719" },
        info: { 50: "#EEF1FB", 600: "#4C5FA6" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "Segoe UI", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "-apple-system", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(33, 31, 27, 0.04), 0 1px 3px rgba(33, 31, 27, 0.06)",
      },
      borderRadius: { xl: "12px" },

      // --- Motion (unchanged from lib/motion.ts) --------------------------
      transitionDuration: {
        feedback: ms(DURATION.feedback),
        enter: ms(DURATION.enter),
        exit: ms(DURATION.exit),
        move: ms(DURATION.move),
      },
      transitionTimingFunction: {
        enter: EASING.enter,
        exit: EASING.exit,
        move: EASING.move,
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        "dialog-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(0.97)" },
          to: { opacity: "1", transform: "none" },
        },
        "dialog-out": {
          from: { opacity: "1", transform: "none" },
          to: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "none" },
          to: { opacity: "0", transform: "translateX(16px)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "70%": { opacity: "1", transform: "scale(1.15)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
        "grow-x": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "grow-y": { from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } },
      },
      animation: {
        "fade-in": `fade-in ${ms(DURATION.enter)} ${EASING.enter} both`,
        "fade-in-fast": `fade-in ${ms(DURATION.feedback)} ${EASING.enter} both`,
        "fade-up": `fade-up ${ms(DURATION.enter)} ${EASING.enter} both`,
        "backdrop-in": `fade-in ${ms(DURATION.enter)} ${EASING.enter} both`,
        "backdrop-out": `fade-out ${ms(DURATION.exit)} ${EASING.exit} both`,
        "dialog-in": `dialog-in ${ms(DURATION.enter)} ${EASING.enter} both`,
        "dialog-out": `dialog-out ${ms(DURATION.exit)} ${EASING.exit} both`,
        "toast-in": `toast-in ${ms(DURATION.enter)} ${EASING.enter} both`,
        "toast-out": `toast-out ${ms(DURATION.exit)} ${EASING.exit} both`,
        pop: `pop ${ms(DURATION.enter)} ${EASING.enter} both`,
        shake: `shake 320ms ${EASING.move} both`,
        "grow-x": `grow-x ${ms(DURATION.move)} ${EASING.enter} both`,
        "grow-y": `grow-y ${ms(DURATION.move)} ${EASING.enter} both`,
      },
    },
  },
  plugins: [],
};

export default config;

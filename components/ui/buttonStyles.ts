// Gaya tombol dipakai bersama oleh <Button> dan <LinkButton> supaya tautan
// bergaya tombol tidak perlu menyalin string kelas Tailwind.
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export const BUTTON_VARIANTS: Record<ButtonVariant, { base: string; interactive: string }> = {
  primary: {
    base: "bg-brand-600 text-white border-transparent",
    interactive: "hover:bg-brand-700 active:bg-brand-900",
  },
  secondary: {
    base: "bg-white text-ink-700 border-line",
    interactive: "hover:bg-surface-muted active:bg-surface-sunken",
  },
  ghost: {
    base: "text-ink-700 border-transparent",
    interactive: "hover:bg-surface-muted active:bg-surface-sunken",
  },
  danger: {
    base: "bg-danger-600 text-white border-transparent",
    interactive: "hover:bg-danger-700 active:bg-danger-800",
  },
};

// Ukuran memakai prop `size`, bukan className, karena utilitas Tailwind yang
// bertabrakan (px-4 vs px-3, text-sm vs text-xs) tidak bisa saling menimpa lewat className.
export const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

export const BUTTON_BASE = "inline-flex items-center justify-center gap-2 rounded-lg border font-medium";

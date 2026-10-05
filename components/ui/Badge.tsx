import { clsx } from "clsx";
import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "bg-brand-100 text-brand-700",
  warning: "bg-warn-50 text-warn-600",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-info-50 text-info-600",
  neutral: "bg-surface-sunken text-ink-500",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_STYLES[tone],
      )}
    >
      {children}
    </span>
  );
}

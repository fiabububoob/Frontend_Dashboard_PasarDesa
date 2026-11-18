import { clsx } from "clsx";
import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "bg-[#DDF5E5] text-brand-700",
  warning: "bg-[#FDF0C8] text-[#8A5300]",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-[#DEE8FB] text-[#2F4A9A]",
  neutral: "bg-[#E7EAEE] text-ink-700",
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

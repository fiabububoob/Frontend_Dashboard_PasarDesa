import { clsx } from "clsx";
import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
}

// Dipakai untuk edge case: daftar kosong, hasil pencarian nihil, dan error muat data.
// Selalu beri tahu pengguna APA yang terjadi dan APA yang bisa dilakukan berikutnya.
export function EmptyState({ icon: Icon = Inbox, title, description, action, tone = "neutral" }: EmptyStateProps) {
  return (
    <div className="flex animate-fade-up flex-col items-center px-6 py-10 text-center">
      <div
        className={clsx(
          "flex h-12 w-12 items-center justify-center rounded-full",
          tone === "error" ? "bg-danger-50 text-danger-600" : "bg-surface-sunken text-ink-400",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

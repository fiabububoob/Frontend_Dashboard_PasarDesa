import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "./Card";
import { CountUp } from "./CountUp";
import { stagger } from "@/lib/motion";
import type { StatCard as StatCardType } from "@/types";

// Renders a list of StatCard *data* (see types/index.ts) as cards.
//
// Why data-driven: every page (Ringkasan, Komoditas, Pesanan, Kas) opens
// with a row of these. Instead of hand-writing 4 near-identical <Card>
// blocks per page, each page just defines its stats as data (in
// lib/data/*.ts) and passes it here. Adding/removing/reordering a stat is a
// one-line change in the data file — no JSX to touch.
const TONE_VALUE_STYLES: Record<NonNullable<StatCardType["tone"]>, string> = {
  default: "text-ink-900",
  success: "text-brand-600",
  warning: "text-warn-600",
  danger: "text-danger-600",
};

export function StatCardGrid({ stats }: { stats: StatCardType[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        // Offset & Delay: kartu muncul berurutan (40ms) sesuai urutan baca
        <Card key={stat.id} className="animate-fade-up p-5" style={stagger(index)}>
          <p className="text-sm text-ink-500">{stat.label}</p>
          <p className={clsx("mt-2 font-display text-2xl font-bold tracking-tight", TONE_VALUE_STYLES[stat.tone ?? "default"])}>
            <CountUp value={stat.value} />
          </p>
          {(stat.helper || stat.trend) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
              {stat.trend && (
                <span
                  className={clsx(
                    "inline-flex items-center gap-0.5 font-medium",
                    stat.trend.direction === "up" ? "text-brand-600" : "text-danger-600",
                  )}
                >
                  {stat.trend.direction === "up" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {stat.trend.value}
                </span>
              )}
              {stat.helper && <span>{stat.helper}</span>}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

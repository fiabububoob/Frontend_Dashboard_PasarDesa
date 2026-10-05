"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useDetail } from "@/components/detail/DetailProvider";
import { TREN_PANEN, TREN_SERIES } from "@/lib/data/ringkasan";
import { formatNumber, formatRupiah } from "@/lib/format";
import { stagger } from "@/lib/motion";

// Deliberately built as plain CSS bars instead of pulling in a charting
// library — the dataset is tiny (7 days x 4 series) and a hand-rolled grid
// keeps the bundle small and the styling fully under our own design tokens.
// If the data grows (many series, tooltips, zoom), swap this component's
// internals for `recharts` — TREN_PANEN's shape won't need to change.
type Unit = "kg" | "rp";

export function TrenPanenChart() {
  const [unit, setUnit] = useState<Unit>("kg");
  const { open } = useDetail();

  const nilai = (day: (typeof TREN_PANEN)[number], s: (typeof TREN_SERIES)[number]) =>
    unit === "kg" ? day[s.key] : day[s.key] * s.hargaPerKg;
  const label = (v: number) => (unit === "kg" ? `${formatNumber(v)} kg` : formatRupiah(v));

  const maxValue = Math.max(...TREN_PANEN.flatMap((day) => TREN_SERIES.map((s) => nilai(day, s))));

  // Komoditas terlaris & porsinya dihitung dari data, bukan ditulis tangan.
  const totalKg = TREN_SERIES.map((s) => TREN_PANEN.reduce((sum, d) => sum + d[s.key], 0));
  const grandKg = totalKg.reduce((a, b) => a + b, 0);
  const topIndex = totalKg.indexOf(Math.max(...totalKg));
  const topPct = Math.round((totalKg[topIndex] / grandKg) * 100);

  return (
    <Card className="p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-medium uppercase text-ink-400">Analisis Komoditas Unggulan · 7 Hari Terakhir</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink-900">Tren Volume &amp; Penjualan Panen</h3>
        </div>
        <div role="group" aria-label="Satuan chart" className="flex gap-2 text-xs font-medium">
          {(
            [
              ["kg", "Kilogram (Kg)"],
              ["rp", "Rupiah (Rp)"],
            ] as const
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              aria-pressed={unit === value}
              onClick={() => setUnit(value)}
              className={`rounded-lg border px-3 py-1.5 transition-colors duration-feedback ease-enter ${unit === value ? "border-brand-600 bg-brand-600 text-white" : "border-line text-ink-700 hover:bg-surface-muted"}`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-500">
        {TREN_SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            {s.key}
          </span>
        ))}
      </div>

      <div className="relative mt-6">
        {/* Garis bantu putus-putus di belakang batang (tinggi sama dengan area batang, h-40) */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-2 flex h-40 flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-dashed border-line" />
          ))}
        </div>

        <div className="relative grid grid-cols-7 gap-2">
          {TREN_PANEN.map((day, dayIndex) => {
            const hariIni = day.hari === "Hari Ini";
            return (
              <div key={day.hari} className={`flex flex-col items-center gap-2 rounded-lg px-1 pb-2 pt-2 ${hariIni ? "bg-surface-muted" : ""}`}>
                <div className="flex h-40 w-full items-end justify-center gap-1">
                  {TREN_SERIES.map((s) => {
                    const value = nilai(day, s);
                    const heightPct = Math.max((value / maxValue) * 100, 4);
                    return (
                      <div
                        key={`${s.key}-${unit}`}
                        className={`w-2.5 origin-bottom animate-grow-y rounded-t-md ${s.color}`}
                        style={{ height: `${heightPct}%`, ...stagger(dayIndex) }}
                        title={`${s.key} · ${day.hari}: ${label(value)}`}
                      />
                    );
                  })}
                </div>
                <span className={`text-xs ${hariIni ? "font-semibold text-ink-900" : "text-ink-400"}`}>{day.hari}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col justify-between gap-2 border-t border-line pt-4 text-sm sm:flex-row sm:items-center">
        <p className="text-ink-500">
          Perputaran komoditas terlaris:{" "}
          <span className="font-medium text-ink-900">
            {TREN_SERIES[topIndex].key} ({topPct}% dari seluruh bobot lumbung)
          </span>
        </p>
        <button type="button" onClick={() => open({ type: "laporan" })} className="shrink-0 text-sm font-medium text-brand-600 hover:underline">
          Detail Laporan Panen →
        </button>
      </div>
    </Card>
  );
}

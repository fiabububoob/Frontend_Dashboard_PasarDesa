"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { TREN_PANEN, TREN_SERIES } from "@/lib/data/ringkasan";
import { formatNumber, formatRupiah } from "@/lib/format";

export function LaporanContent() {
  const toast = useToast();
  const totalKg = TREN_SERIES.map((s) => TREN_PANEN.reduce((sum, d) => sum + d[s.key], 0));
  const grandKg = totalKg.reduce((a, b) => a + b, 0);
  const grandRp = TREN_SERIES.reduce((sum, s, i) => sum + totalKg[i] * s.hargaPerKg, 0);

  function unduhCsv() {
    const rows = [
      ["Hari", ...TREN_SERIES.map((s) => `${s.key} (kg)`), "Total (kg)", "Nilai (Rp)"],
      ...TREN_PANEN.map((d) => {
        const kg = TREN_SERIES.map((s) => d[s.key]);
        const rp = TREN_SERIES.reduce((sum, s) => sum + d[s.key] * s.hargaPerKg, 0);
        return [d.hari, ...kg, kg.reduce((a, b) => a + b, 0), rp];
      }),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan-panen-7-hari.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: "success", title: "Laporan diunduh", description: "laporan-panen-7-hari.csv" });
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-ink-400">
              <th className="pb-2 font-medium">Komoditas</th>
              <th className="pb-2 text-right font-medium">Volume (kg)</th>
              <th className="pb-2 text-right font-medium">Porsi</th>
              <th className="pb-2 text-right font-medium">Nilai (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {TREN_SERIES.map((s, i) => (
              <tr key={s.key}>
                <td className="py-2.5 text-ink-900">
                  <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.color}`} />
                  {s.key}
                </td>
                <td className="py-2.5 text-right tabular-nums">{formatNumber(totalKg[i])}</td>
                <td className="py-2.5 text-right tabular-nums">{Math.round((totalKg[i] / grandKg) * 100)}%</td>
                <td className="py-2.5 text-right tabular-nums">{formatRupiah(totalKg[i] * s.hargaPerKg)}</td>
              </tr>
            ))}
            <tr className="font-semibold text-ink-900">
              <td className="pt-3">Total</td>
              <td className="pt-3 text-right tabular-nums">{formatNumber(grandKg)}</td>
              <td className="pt-3 text-right">100%</td>
              <td className="pt-3 text-right tabular-nums">{formatRupiah(grandRp)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-400">Nilai dihitung dari harga acuan per kg tiap komoditas.</p>
      <div className="flex justify-end">
        <Button onClick={unduhCsv}>
          <Download className="h-4 w-4" />
          Unduh CSV
        </Button>
      </div>
    </div>
  );
}

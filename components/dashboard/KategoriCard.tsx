"use client";

import { ChevronRight, Tags } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { kategoriList } from "@/lib/stok";

// Ringkasan per kategori hasil tani. Klik satu kategori → modal berisi
// komoditas di kategori itu (lalu bisa lanjut ke detail komoditas).
export function KategoriCard() {
  const { komoditas } = useDashboardData();
  const { open } = useDetail();
  const kategori = kategoriList(komoditas);

  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Tags className="h-4 w-4 text-brand-600" />
        Kategori Hasil Tani
      </p>
      <ul className="mt-3 space-y-1.5">
        {kategori.map((c) => (
          <li key={c.nama}>
            <button
              type="button"
              onClick={() => open({ type: "kategori", nama: c.nama })}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-left transition-colors duration-feedback ease-enter hover:bg-surface-muted"
            >
              <span>
                <span className="block text-sm font-medium text-ink-900">{c.nama}</span>
                <span className="block text-xs text-ink-500">
                  {c.count} komoditas{c.kritis > 0 && <span className="text-danger-600"> · {c.kritis} stok kritis</span>}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

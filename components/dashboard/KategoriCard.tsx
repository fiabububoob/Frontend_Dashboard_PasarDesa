"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Tags } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { kategoriList } from "@/lib/stok";

const RINGKAS = 4;

// Ringkasan per kategori hasil tani. Awalnya hanya kategori terbanyak yang tampil supaya kartu tidak
// memanjang; "Lihat semua" membuka sisanya (daftar bisa di-scroll), "Sembunyikan" melipatnya lagi.
// Klik satu kategori → modal berisi komoditas di kategori itu (lalu bisa lanjut ke detail komoditas).
export function KategoriCard() {
  const { komoditas } = useDashboardData();
  const { open } = useDetail();
  const [terbuka, setTerbuka] = useState(false);
  const semua = kategoriList(komoditas).sort((a, b) => b.count - a.count || a.nama.localeCompare(b.nama));
  const tampil = terbuka ? semua : semua.slice(0, RINGKAS);
  const terbanyak = semua[0]?.count ?? 0;
  const sisa = semua.length - RINGKAS;

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Tags className="h-4 w-4 text-brand-600" />
          Kategori Hasil Tani
        </p>
        <span className="text-xs text-ink-500">{komoditas.length} komoditas</span>
      </div>

      <ul id="daftar-kategori" className={`mt-3 space-y-2.5 ${terbuka ? "max-h-64 overflow-y-auto pr-1" : ""}`}>
        {tampil.map((c) => (
          <li key={c.nama}>
            <button type="button" onClick={() => open({ type: "kategori", nama: c.nama })} className="group block w-full text-left">
              <span className="flex items-baseline justify-between gap-2 text-sm">
                <span className="min-w-0 truncate font-medium text-ink-900 group-hover:text-brand-700">{c.nama}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-ink-500">
                  {c.kritis > 0 && <span className="text-danger-600">{c.kritis} kritis ·</span>}
                  <span className="font-semibold text-ink-900">{c.count}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                </span>
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                <span className="block h-full rounded-full bg-brand-500" style={{ width: `${terbanyak > 0 ? Math.max((c.count / terbanyak) * 100, 4) : 0}%` }} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {sisa > 0 && (
        <button
          type="button"
          aria-expanded={terbuka}
          aria-controls="daftar-kategori"
          onClick={() => setTerbuka((v) => !v)}
          className="mt-auto flex items-center justify-center gap-1 pt-4 text-xs font-semibold text-brand-600 hover:underline"
        >
          {terbuka ? "Sembunyikan" : `Lihat semua (${semua.length})`}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-feedback ease-enter ${terbuka ? "rotate-180" : ""}`} aria-hidden />
        </button>
      )}
    </Card>
  );
}

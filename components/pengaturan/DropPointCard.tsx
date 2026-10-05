"use client";

import { clsx } from "clsx";
import { MapPinned, Warehouse, Building2, Fence } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { LOKASI_DROP_POINT, STANDAR_PENGEMASAN } from "@/lib/data/pengaturan";
import { usePengaturanForm } from "./PengaturanForm";

const ICONS = [Warehouse, Building2, Fence];

export function DropPointCard() {
  const { draft, update } = usePengaturanForm();
  const { pengaturan } = useDashboardData();

  function toggleStandar(label: string, on: boolean) {
    const next = on ? [...draft.standarPengemasan, label] : draft.standarPengemasan.filter((s) => s !== label);
    // Urutan mengikuti daftar baku supaya perbandingan "ada perubahan?" tidak salah.
    update({ standarPengemasan: STANDAR_PENGEMASAN.filter((s) => next.includes(s)) });
  }

  return (
    <Card className="p-5">
      <SectionHeader huruf="C" judul="Integrasi Drop-Point & Standar Kurir Desa" deskripsi="Pilih titik serah-terima panen ke kurir desa." icon={MapPinned} />

      <p className="mt-4 text-sm font-medium text-ink-900">Pilih Lokasi Fisik Lumbung / Pos Penjemputan Paket</p>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LOKASI_DROP_POINT.map((lokasi, i) => {
          const Icon = ICONS[i] ?? Warehouse;
          const active = draft.dropPointId === lokasi.id;
          const tersimpan = pengaturan.dropPointId === lokasi.id;
          return (
            <button
              key={lokasi.id}
              type="button"
              aria-pressed={active}
              onClick={() => update({ dropPointId: lokasi.id })}
              className={clsx(
                "rounded-lg border p-3.5 text-left transition-colors duration-feedback ease-enter",
                active ? "border-brand-500 bg-brand-50/60" : "border-line hover:bg-surface-muted",
              )}
            >
              <Icon className={clsx("h-5 w-5", active ? "text-brand-600" : "text-ink-400")} />
              <p className="mt-2 text-sm font-medium text-ink-900">{lokasi.nama}</p>
              <p className="mt-0.5 text-xs text-ink-500">{lokasi.alamat}</p>
              <p className={clsx("mt-1.5 text-xs font-medium", active ? "text-brand-600" : "text-ink-400")}>
                {active ? (tersimpan ? "✓ Titik Aktif Sekarang" : "✓ Aktif setelah disimpan") : lokasi.catatan}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label htmlFor="petunjuk" className="text-sm font-medium text-ink-900">
          Petunjuk Akses bagi Kurir Desa (Mas Slamet &amp; Tim)
        </label>
        <input
          id="petunjuk"
          value={draft.petunjukAkses}
          onChange={(e) => update({ petunjukAkses: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-ink-900">Standar Pengemasan &amp; Tera Sebelum Penyerahan:</p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink-700">
          {STANDAR_PENGEMASAN.map((label) => (
            <label key={label} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.standarPengemasan.includes(label)}
                onChange={(e) => toggleStandar(label, e.target.checked)}
                className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}

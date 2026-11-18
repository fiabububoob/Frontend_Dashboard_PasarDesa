"use client";

import Link from "next/link";
import { Camera, Flag, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Bintang } from "@/components/ui/Bintang";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { LABEL_ALASAN } from "@/lib/komplain";
import { formatRating } from "@/lib/ulasanApi";

// Widget Ringkasan: pengaduan yang menunggu ditangani (komplain pesanan + tiket aduan dari aplikasi mobile).
export function PengaduanTerbaruCard() {
  const { pesanan, aduan } = useDashboardData();
  const { open } = useDetail();

  const baru = [
    ...pesanan.filter((p) => p.komplain?.status === "diajukan").map((p) => ({ jenis: "Pesanan" as const, id: p.id, topik: LABEL_ALASAN[p.komplain!.alasan], pembeli: p.pembeli, waktu: p.komplain!.diajukanPada, foto: p.komplain!.foto.length })),
    ...aduan.filter((a) => a.status === "diverifikasi").map((a) => ({ jenis: "Tiket" as const, id: a.id, topik: a.topik, pembeli: a.pembeli, waktu: a.dibuatPada, foto: a.foto.length })),
  ].sort((x, y) => new Date(y.waktu).getTime() - new Date(x.waktu).getTime());

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Flag className="h-4 w-4 text-danger-600" aria-hidden />
          Pengaduan Perlu Ditangani
        </p>
        <Link href="/pengaduan" className="text-xs font-semibold text-brand-600 hover:underline">
          Lihat semua
        </Link>
      </div>

      {baru.length === 0 ? (
        <p className="mt-4 text-xs text-ink-500">Tidak ada pengaduan baru. Semua sudah ditindaklanjuti.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {baru.slice(0, 3).map((b) => (
            <li key={`${b.jenis}-${b.id}`}>
              <button type="button" onClick={() => open(b.jenis === "Pesanan" ? { type: "pesanan", id: b.id } : { type: "aduan", id: b.id })} className="flex w-full items-start justify-between gap-3 py-2.5 text-left hover:bg-surface-muted">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink-900">{b.topik}</span>
                  <span className="block truncate text-xs text-ink-500">
                    {b.pembeli} · {b.jenis} #{b.id}
                  </span>
                </span>
                {b.foto > 0 && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-500">
                    <Camera className="h-3.5 w-3.5" aria-hidden />
                    {b.foto}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// Widget Ringkasan: rating rata-rata dan dua ulasan terbaru.
export function UlasanTerbaruCard() {
  const { ulasan } = useDashboardData();
  const ringkasan = ulasan?.ringkasan;
  const terbaru = (ulasan?.ulasan ?? []).slice(0, 2);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Star className="h-4 w-4 text-[#F5A623]" aria-hidden />
          Rating & Ulasan
        </p>
        <Link href="/ulasan" className="text-xs font-semibold text-brand-600 hover:underline">
          Lihat semua
        </Link>
      </div>

      {!ringkasan || ringkasan.total === 0 ? (
        <p className="mt-4 text-xs text-ink-500">Belum ada ulasan dari pembeli.</p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-ink-900">{formatRating(ringkasan.rataRata)}</span>
            <div>
              <Bintang nilai={ringkasan.rataRata} />
              <p className="text-xs text-ink-500">
                {ringkasan.total} ulasan · {ringkasan.denganFoto} berfoto
              </p>
            </div>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {terbaru.map((u) => (
              <li key={u.id} className="py-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-ink-900">{u.pembeli}</span>
                  <Bintang nilai={u.rating} ukuran="h-3 w-3" />
                </div>
                <p className="truncate text-ink-500">{u.note ?? u.items.map((i) => i.komoditas).join(", ")}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

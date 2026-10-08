"use client";

import { FotoProduk } from "@/components/ui/FotoProduk";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useStatusLapak } from "@/components/providers/useStatusLapak";
import { LOKASI_DROP_POINT } from "@/lib/data/pengaturan";
import { formatRupiah } from "@/lib/format";
import { jadwalHariIni } from "@/lib/pengaturan";
import { AMBANG_KRITIS } from "@/lib/stok";
import type { PengaturanLapak } from "@/types";

// Tampilan lapak seperti yang dilihat warga di aplikasi PasarDesa. Memakai
// draft yang dikirim dari form (bila ada) supaya perubahan yang belum
// disimpan bisa dicek dulu; katalog diambil dari data komoditas hidup, jadi
// komoditas yang di-toggle "tampil" atau stoknya menipis ikut terlihat.
export function PratinjauWargaContent({ data }: { data?: PengaturanLapak }) {
  const { pengaturan, jedaTanam, komoditas, profil } = useDashboardData();
  const p = data ?? pengaturan;
  const { status, sekarang } = useStatusLapak(p);
  const hari = sekarang ? jadwalHariIni(p.jadwal, sekarang) : undefined;

  const lokasi = LOKASI_DROP_POINT.find((l) => l.id === p.dropPointId) ?? LOKASI_DROP_POINT[0];
  const katalog = komoditas.filter((k) => k.tampil);
  const kategori = Array.from(new Set(katalog.map((k) => k.kategori)));
  const tutup = status ? !status.buka : false;

  return (
    <div className="space-y-3 text-sm">
      {data && <p className="rounded-lg bg-warn-50 p-2.5 text-xs text-warn-600">Pratinjau memakai isian yang belum disimpan.</p>}

      {/* Bingkai ponsel */}
      <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className={`relative h-28 bg-gradient-to-br ${tutup ? "from-ink-400 to-ink-200" : "from-brand-700 to-brand-500"}`}>
          {status && (
            <span className={`absolute left-3 top-3 rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold ${status.buka ? "text-brand-700" : "text-danger-600"}`}>
              ● {status.label}
            </span>
          )}
          {status && <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white/90">{status.keterangan}</span>}
          <Avatar nama={p.namaLapak} foto={profil.foto} className="absolute -bottom-6 right-4 h-14 w-14 border-2 border-white text-base" />
        </div>

        <div className="space-y-3 p-4 pt-3">
          <div>
            <p className="flex items-center gap-1.5 text-base font-semibold text-ink-900">
              {p.namaLapak || "Nama lapak belum diisi"}
            </p>
            <p className="mt-1 text-xs text-ink-500">{p.deskripsi}</p>
          </div>

          {p.komoditasUnggulan.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.komoditasUnggulan.map((t) => (
                <span key={t} className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                  {t}
                </span>
              ))}
            </div>
          )}

          <dl className="space-y-1.5 rounded-lg bg-surface-muted p-3 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Jam buka hari ini</dt>
              <dd className="font-medium text-ink-900">{hari && hari.status !== "tutup" ? `${hari.buka} – ${hari.tutup} WIB` : "Tutup"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Batas pesan hari ini</dt>
              <dd className="font-medium text-warn-600">{hari && hari.status !== "tutup" ? `${hari.cutOff} WIB` : "-"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Ambil di</dt>
              <dd className="text-right font-medium text-ink-900">{lokasi.nama}</dd>
            </div>
            <p className="pt-1 text-ink-400">📍 {lokasi.alamat}</p>
            {p.petunjukAkses && <p className="text-ink-400">ℹ️ {p.petunjukAkses}</p>}
          </dl>

          {tutup && (
            <p role="status" className="rounded-lg bg-danger-50 p-3 text-xs font-medium text-danger-600">
              {jedaTanam ? "Lapak sedang jeda tanam — pemesanan dinonaktifkan sementara." : "Lapak sedang tutup — pesanan dibuka kembali sesuai jadwal."}
            </p>
          )}

          <div>
            <p className="text-xs font-medium uppercase text-ink-400">Katalog ({katalog.length} komoditas)</p>
            {kategori.length === 0 && <p className="mt-2 text-xs text-ink-500">Belum ada komoditas yang ditampilkan.</p>}
            {kategori.map((kat) => (
              <div key={kat} className="mt-3">
                <p className="text-xs font-semibold text-ink-700">{kat}</p>
                <ul className={`mt-1.5 divide-y divide-line rounded-lg border border-line ${tutup ? "opacity-50" : ""}`}>
                  {katalog
                    .filter((k) => k.kategori === kat)
                    .map((k) => (
                      <li key={k.id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <FotoProduk nama={k.nama} foto={k.foto?.[0]} ikon={k.gambar} className="h-9 w-9 text-lg" />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-medium text-ink-900">{k.nama}</span>
                            <span className="block text-[11px] text-ink-400">per {k.satuan}</span>
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-xs font-semibold text-ink-900">{formatRupiah(k.harga)}</span>
                          {k.stok < AMBANG_KRITIS ? <Badge tone="danger">Stok menipis</Badge> : null}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

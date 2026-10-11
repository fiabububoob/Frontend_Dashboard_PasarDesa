"use client";

import { FotoProduk } from "@/components/ui/FotoProduk";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StockBar } from "@/components/komoditas/StockBar";
import { StatusBadge } from "@/components/pesanan/StatusBadge";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { cariKomoditasByNama } from "@/lib/stok";
import { formatRupiah } from "@/lib/format";
import { useDetail } from "./DetailProvider";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { labelBadge, waktuPanenLabel } from "@/lib/komoditas";

export function KomoditasContent({ id }: { id: string }) {
  const { komoditas, pesanan } = useDashboardData();
  const { push } = useDetail();
  const sekarang = useSekarang();

  const k = komoditas.find((x) => x.id === id);

  if (!k) return <p className="text-sm text-ink-500">Komoditas tidak ditemukan.</p>;

  const terkait = pesanan.filter((p) => p.items.some((i) => cariKomoditasByNama(komoditas, i.komoditas)?.id === k.id));

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-3">
        <FotoProduk nama={k.nama} foto={k.foto?.[0]} ikon={k.gambar} className="h-14 w-14 text-3xl" />
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => push({ type: "kategori", nama: k.kategori })}
            className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition-colors duration-feedback ease-enter hover:bg-brand-100"
          >
            {k.kategori} →
          </button>
          <div className="flex flex-wrap gap-1.5">
            {k.badge?.map((kode) => (
              <Badge key={kode} tone="success">
                {labelBadge(kode)}
              </Badge>
            ))}
            {k.tag && <Badge tone="info">{k.tag}</Badge>}
            <Badge tone={k.tampil ? "success" : "neutral"}>{k.tampil ? "Tampil di aplikasi" : "Disembunyikan"}</Badge>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-ink-500">Harga</dt>
          <dd className="font-medium text-ink-900">
            {formatRupiah(k.harga)} <span className="text-xs font-normal text-ink-400">/ {k.satuan}{k.ukuran ? ` (${k.ukuran})` : ""}</span>
            {k.hargaCoret && <span className="ml-1.5 text-xs font-normal text-ink-400 line-through">{formatRupiah(k.hargaCoret)}</span>}
          </dd>
          {k.hargaKeterangan && <dd className="text-xs text-ink-400">{k.hargaKeterangan}</dd>}
        </div>
        <div>
          <dt className="text-xs text-ink-500">Waktu Panen</dt>
          <dd className="font-medium text-ink-900">{sekarang ? waktuPanenLabel(k, sekarang) : k.waktuPanen}</dd>
          {k.waktuKeterangan && <dd className="text-xs text-ink-400">{k.waktuKeterangan}</dd>}
        </div>
        <div className="col-span-2">
          <dt className="mb-1 text-xs text-ink-500">Asal: {k.asalBlok}</dt>
          <dd>
            <StockBar komoditas={k} />
          </dd>
        </div>
      </dl>

      {(k.deskripsi || k.spesifikasi?.length || k.saranPenyimpanan) && (
        <div className="space-y-3 border-t border-line pt-4">
          <p className="text-xs font-medium uppercase text-ink-400">Detail untuk pembeli</p>
          {k.deskripsi && <p className="text-ink-700">{k.deskripsi}</p>}
          {k.spesifikasi && k.spesifikasi.length > 0 && (
            <dl className="divide-y divide-line rounded-lg border border-line text-xs">
              {k.spesifikasi.map((s) => (
                <div key={s.label} className="flex justify-between gap-4 px-3 py-2">
                  <dt className="text-ink-500">{s.label}</dt>
                  <dd className="text-right font-medium text-ink-900">{s.nilai}</dd>
                </div>
              ))}
            </dl>
          )}
          {k.saranPenyimpanan && <p className="rounded-lg bg-warn-50 p-3 text-xs text-warn-600">💡 {k.saranPenyimpanan}</p>}
        </div>
      )}

      {terkait.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase text-ink-400">Ada di pesanan</p>
          <ul className="mt-2 space-y-1.5">
            {terkait.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => push({ type: "pesanan", id: p.id })}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-left transition-colors duration-feedback ease-enter hover:bg-surface-muted"
                >
                  <span>
                    <span className="block font-medium text-ink-900">#{p.id}</span>
                    <span className="block text-xs text-ink-500">{p.pembeli}</span>
                  </span>
                  <StatusBadge status={p.status} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Link
          href="/komoditas"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
        >
          <ExternalLink className="h-4 w-4" />
          Buka halaman Komoditas
        </Link>
        <Button variant="secondary" onClick={() => push({ type: "form-komoditas", id: k.id })}>
          <Pencil className="h-4 w-4" />
          Ubah
        </Button>
        <Button onClick={() => push({ type: "tambah-panen", komoditasId: k.id })}>
          <Plus className="h-4 w-4" />
          Tambah Stok
        </Button>
      </div>
    </div>
  );
}
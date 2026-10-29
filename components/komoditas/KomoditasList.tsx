"use client";

import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { FotoProduk } from "@/components/ui/FotoProduk";
import { useDetail } from "@/components/detail/DetailProvider";
import { stagger } from "@/lib/motion";
import { formatRupiah } from "@/lib/format";
import { indukNama, inisialProduk, ketersediaanDari, LABEL_STATUS_TAMPILAN, labelBadge, penjualDari, statusTampilan, sumberDari, type StatusTampilan } from "@/lib/komoditas";
import { BARIS_AKSI, WARNA_TILE } from "./tampilan";
import { MenuAksiKomoditas } from "./MenuAksiKomoditas";
import { Pencil } from "lucide-react";
import type { Komoditas } from "@/types";

const TONE_STATUS: Record<StatusTampilan, "success" | "warning" | "neutral"> = { aktif: "success", "stok-rendah": "warning", nonaktif: "neutral" };

export function StatusPill({ k }: { k: Komoditas }) {
  const s = statusTampilan(k);
  return <Badge tone={TONE_STATUS[s]}>{LABEL_STATUS_TAMPILAN[s]}</Badge>;
}

// Label tampilan produk (Panen Baru, Murni 100%, …) sebagai kapsul hijau kecil.
export function LabelProduk({ k, penuh }: { k: Komoditas; penuh?: boolean }) {
  const label = k.badge?.[0] ? labelBadge(k.badge[0]) : undefined;
  if (!label) return null;
  return (
    <span className={`inline-block rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ${penuh ? "w-full" : ""}`}>{label}</span>
  );
}

// Foto produk: foto unggahan bila ada, selain itu kotak berwarna dengan inisial (sesuai desain).
export function TileProduk({ k, className }: { k: Komoditas; className: string }) {
  const index = Math.abs([...k.id].reduce((a, c) => a + c.charCodeAt(0), 0)) % WARNA_TILE.length;
  return k.foto?.[0] ? (
    <FotoProduk nama={k.nama} foto={k.foto[0]} ikon={k.gambar} className={className} />
  ) : (
    <span role="img" aria-label={k.nama} className={`flex shrink-0 items-center justify-center rounded-xl font-bold text-ink-900/80 ${className}`} style={{ backgroundColor: WARNA_TILE[index] }}>
      {inisialProduk(k.nama)}
    </span>
  );
}

interface Props {
  data: Komoditas[];
  terpilih: Set<string>;
  onPilih: (id: string, pilih: boolean) => void;
  onPilihSemua: (pilih: boolean) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

// Tampilan daftar (tabel) komoditas.
export function KomoditasList({ data, terpilih, onPilih, onPilihSemua, emptyTitle = "Belum ada komoditas", emptyDescription = "Tambahkan hasil panen pertama agar bisa dipesan warga Sukorejo." }: Props) {
  const { open } = useDetail();
  if (data.length === 0) return <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />;
  const semua = data.every((k) => terpilih.has(k.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead>
          <tr className="border-y border-line bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            <th className="w-12 py-3 pl-5">
              <input type="checkbox" aria-label="Pilih semua komoditas" checked={semua} onChange={(e) => onPilihSemua(e.target.checked)} className="h-4 w-4 rounded border-line accent-brand-600" />
            </th>
            <th className="px-2 py-3">Foto</th>
            <th className="px-3 py-3">Nama Komoditas</th>
            <th className="px-3 py-3">Kategori</th>
            <th className="px-3 py-3">Penjual</th>
            <th className="px-3 py-3">Harga</th>
            <th className="px-3 py-3">Stok</th>
            <th className="px-3 py-3">Terjual</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-5 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.map((k, i) => (
            <tr key={k.id} className="animate-fade-in align-middle" style={stagger(i)}>
              <td className="py-4 pl-5">
                <input type="checkbox" aria-label={`Pilih ${k.nama}`} checked={terpilih.has(k.id)} onChange={(e) => onPilih(k.id, e.target.checked)} className="h-4 w-4 rounded border-line accent-brand-600" />
              </td>
              <td className="px-2 py-4">
                <TileProduk k={k} className="h-11 w-11 text-sm" />
              </td>
              <td className="max-w-[220px] px-3 py-4">
                <button type="button" onClick={() => open({ type: "komoditas", id: k.id })} className="text-left font-bold leading-snug text-ink-900 hover:text-brand-700">
                  {k.nama}
                </button>
                <div className="mt-1">
                  <LabelProduk k={k} />
                </div>
              </td>
              <td className="px-3 py-4 text-ink-900">
                <p>{indukNama(k)}</p>
                <p className="text-xs text-ink-500">{k.kategori}</p>
              </td>
              <td className="max-w-[160px] px-3 py-4 text-ink-900">
                <p>{penjualDari(k)}</p>
                <p className="text-xs text-ink-500">{sumberDari(k)}</p>
              </td>
              <td className="whitespace-nowrap px-3 py-4">
                <p className="font-bold text-rupiah">{formatRupiah(k.harga)}</p>
                <p className="text-xs text-ink-500">/ {k.ukuran && k.ukuran !== `1 ${k.satuan}` ? `${k.satuan} (${k.ukuran})` : k.satuan}</p>
              </td>
              <td className="px-3 py-4">
                <p className={statusTampilan(k) === "stok-rendah" ? "font-bold text-[#8A5300]" : "text-ink-900"}>
                  {k.stok} {k.satuan}
                </p>
                <p className="text-xs text-ink-500">{ketersediaanDari(k)}</p>
              </td>
              <td className="px-3 py-4 text-ink-900">{k.terjual ?? 0}</td>
              <td className="px-3 py-4">
                <StatusPill k={k} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label={`Ubah ${k.nama}`} onClick={() => open({ type: "form-komoditas", id: k.id })} className={BARIS_AKSI}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <MenuAksiKomoditas k={k} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDetail } from "@/components/detail/DetailProvider";
import { stagger } from "@/lib/motion";
import { formatRupiah } from "@/lib/format";
import { indukNama, inisialProduk, penjualDari, statusTampilan, sumberDari } from "@/lib/komoditas";
import { LabelProduk, StatusPill } from "./KomoditasList";
import { MenuAksiKomoditas } from "./MenuAksiKomoditas";
import { WARNA_TILE } from "./tampilan";
import type { Komoditas } from "@/types";

// Tampilan kartu (grid) komoditas.
export function KomoditasGrid({ data, emptyTitle = "Belum ada komoditas", emptyDescription = "Tambahkan hasil panen pertama agar bisa dipesan warga Sukorejo." }: { data: Komoditas[]; emptyTitle?: string; emptyDescription?: string }) {
  const { open } = useDetail();
  if (data.length === 0) return <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((k, i) => {
        const warna = WARNA_TILE[Math.abs([...k.id].reduce((a, c) => a + c.charCodeAt(0), 0)) % WARNA_TILE.length];
        const rendah = statusTampilan(k) === "stok-rendah";
        return (
          <article key={k.id} className="animate-fade-in overflow-hidden rounded-2xl border border-line bg-white" style={stagger(i)}>
            <div className="relative flex h-[107px] items-center justify-center" style={{ backgroundColor: k.foto?.[0] ? undefined : warna }}>
              {k.foto?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- foto berupa data URL dari unggahan pengguna
                <img src={k.foto[0]} alt={k.nama} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="text-[32px] font-bold text-ink-900/80">{inisialProduk(k.nama)}</span>
              )}
              <span className="absolute left-2.5 top-2.5">
                <StatusPill k={k} />
              </span>
              <span className="absolute right-2.5 top-2.5">
                <MenuAksiKomoditas k={k} />
              </span>
            </div>
            <div className="space-y-1.5 p-3.5 text-sm">
              <button type="button" onClick={() => open({ type: "komoditas", id: k.id })} className="block min-h-[2.5rem] text-left font-bold leading-snug text-ink-900 hover:text-brand-700">
                {k.nama}
              </button>
              <p className="text-xs text-ink-500">
                {indukNama(k)} / {k.kategori}
              </p>
              <div className="min-h-[22px]">
                <LabelProduk k={k} penuh />
              </div>
              <p>
                <span className="text-base font-bold text-rupiah">{formatRupiah(k.harga)}</span> <span className="text-xs text-ink-500">/ {k.satuan}{k.ukuran ? ` (${k.ukuran})` : ""}</span>
              </p>
              <p className="flex justify-between text-xs text-ink-700">
                <span className={rendah ? "font-bold text-[#8A5300]" : undefined}>
                  Stok: {k.stok} {k.satuan}
                </span>
                <span>Terjual: {k.terjual ?? 0}</span>
              </p>
              <p className="border-t border-line pt-2 text-xs text-ink-500">
                {penjualDari(k)} · {sumberDari(k)}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

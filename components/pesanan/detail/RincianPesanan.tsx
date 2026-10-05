"use client";

import { Badge } from "@/components/ui/Badge";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { ONGKIR_FLAT, SUBSIDI_ONGKIR } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cariKomoditasByNama } from "@/lib/stok";
import type { Pesanan } from "@/types";

const IKON_BAWAAN = "🌾";

// Daftar komoditas yang dipesan, lalu rincian biaya. Nama komoditas yang ada di
// katalog bisa diklik untuk membuka detailnya.
export function RincianPesanan({ pesanan }: { pesanan: Pesanan }) {
  const { komoditas } = useDashboardData();
  const { open } = useDetail();
  const subtotal = pesanan.items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-900">Rincian Komoditas Panen</p>
          <span className="text-xs text-ink-400">Panen Baru 1 Hari Lalu</span>
        </div>
        <div className="mt-3 space-y-3">
          {pesanan.items.map((item) => {
            const katalog = cariKomoditasByNama(komoditas, item.komoditas);
            return (
              <div key={item.komoditas} className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-lg">{katalog?.gambar ?? IKON_BAWAAN}</div>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
                      {katalog ? (
                        <button type="button" onClick={() => open({ type: "komoditas", id: katalog.id })} className="text-left hover:text-brand-700 hover:underline">
                          {item.komoditas}
                        </button>
                      ) : (
                        item.komoditas
                      )}
                      {item.tag && <Badge tone="success">{item.tag}</Badge>}
                    </p>
                    <p className="text-xs text-ink-400">{item.jumlah}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-ink-900">{formatRupiah(item.subtotal)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <BarisBiaya label="Subtotal Hasil Panen" nilai={formatRupiah(subtotal)} />
        <BarisBiaya label="Subsidi Ongkir Logistik Desa (BUMDes Berdaya)" nilai={`- ${formatRupiah(SUBSIDI_ONGKIR)}`} className="text-brand-600" />
        <BarisBiaya label="Ongkir Kurir Desa Sukorejo (Flat Dusun)" nilai={formatRupiah(ONGKIR_FLAT)} />
        <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink-900">
          <span>{pesanan.metodeBayar === "QRIS" ? "Total Pembayaran Lunas" : "Total Dibayar di Tempat (COD)"}</span>
          <span className="text-brand-600">{formatRupiah(pesanan.total)}</span>
        </div>
      </div>
    </>
  );
}

function BarisBiaya({ label, nilai, className = "text-ink-500" }: { label: string; nilai: string; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span>{label}</span>
      <span>{nilai}</span>
    </div>
  );
}

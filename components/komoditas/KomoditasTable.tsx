"use client";

import { FotoProduk } from "@/components/ui/FotoProduk";
import { Inbox, Pencil } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { VisibilityToggle } from "./VisibilityToggle";
import { stagger } from "@/lib/motion";
import { StockBar } from "./StockBar";
import { formatRupiah } from "@/lib/format";
import { useDetail } from "@/components/detail/DetailProvider";
import type { Komoditas } from "@/types";

interface KomoditasTableProps {
  data: Komoditas[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function KomoditasTable({
  data,
  emptyTitle = "Belum ada komoditas",
  emptyDescription = "Tambahkan hasil panen pertama agar bisa dipesan warga Sukorejo.",
}: KomoditasTableProps) {
  const { open } = useDetail();

  if (data.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Inbox}
          title={emptyTitle}
          description={emptyDescription}
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-muted text-xs uppercase text-ink-400">
              <th className="px-5 py-3 font-medium">Komoditas &amp; Varian</th>
              <th className="px-3 py-3 font-medium">Kategori &amp; Asal Blok</th>
              <th className="px-3 py-3 font-medium">Harga Tani / Subsidi</th>
              <th className="px-3 py-3 font-medium">Ketersediaan Stok</th>
              <th className="px-3 py-3 font-medium">Waktu Panen / Giling</th>
              <th className="px-3 py-3 font-medium">Visibilitas</th>
              <th className="px-5 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.map((item, index) => (
              <tr key={item.id} className="animate-fade-in" style={stagger(index)}>
                <td className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <FotoProduk nama={item.nama} foto={item.foto?.[0]} ikon={item.gambar} className="h-10 w-10 text-lg" />
                    <div>
                      <button
                        type="button"
                        onClick={() => open({ type: "komoditas", id: item.id })}
                        className="text-left font-medium text-ink-900 hover:text-brand-700 hover:underline"
                      >
                        {item.nama}
                      </button>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                        SKU: {item.sku}
                        {item.tag && <Badge tone="info">{item.tag}</Badge>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-ink-700">
                  <button
                    type="button"
                    onClick={() => open({ type: "kategori", nama: item.kategori })}
                    className="text-left hover:text-brand-700 hover:underline"
                  >
                    {item.kategori}
                  </button>
                  <p className="text-xs text-ink-400">{item.asalBlok}</p>
                </td>
                <td className="px-3 py-4">
                  <p className="font-medium text-ink-900">
                    {formatRupiah(item.harga)}
                    <span className="text-xs font-normal text-ink-400"> / {item.satuan}</span>
                  </p>
                  {item.hargaKeterangan && <p className="text-xs text-ink-400">{item.hargaKeterangan}</p>}
                </td>
                <td className="px-3 py-4">
                  <StockBar komoditas={item} />
                </td>
                <td className="px-3 py-4 text-ink-700">
                  <p className="font-medium text-ink-900">{item.waktuPanen}</p>
                  {item.waktuKeterangan && <p className="text-xs text-ink-400">{item.waktuKeterangan}</p>}
                </td>
                <td className="px-3 py-4">
                  <VisibilityToggle id={item.id} nama={item.nama} checked={item.tampil} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    aria-label={`Ubah ${item.nama}`}
                    onClick={() => open({ type: "form-komoditas", id: item.id })}
                    className="rounded-lg p-2 text-ink-500 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { formatRupiah } from "@/lib/format";
import { mutasiBelumFinal } from "@/lib/kas";
import { PrintActions } from "./PrintActions";
import { useDetail } from "./DetailProvider";

// Bukti mutasi satu transaksi. Dicetak lewat .print-area (bisa disimpan sebagai PDF).
export function TransaksiContent({ id }: { id: string }) {
  const { transaksi, rekening } = useDashboardData();
  const { open } = useDetail();
  const t = transaksi.find((x) => x.id === id);
  if (!t) return <p className="text-sm text-ink-500">Transaksi tidak ditemukan.</p>;

  const masuk = t.nominal >= 0;
  // Jika referensi memuat nomor pesanan, tautkan ke detail pesanannya.
  const idPesanan = t.referensi.match(/#(PSD-\d{8}-\d{4})/)?.[1];

  return (
    <div className="space-y-4 text-sm">
      <div className="print-area space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-bold text-ink-900">BUKTI MUTASI KAS</p>
            <p className="text-xs text-ink-500">BUMDes Sukorejo · Poktan Krajan Makmur</p>
          </div>
          <p className="text-right text-xs text-ink-500">
            {t.id}
            <br />
            {t.tanggal} · {t.waktu}
          </p>
        </div>

        <div className="rounded-xl border border-line p-4 text-center">
          <p className="text-xs text-ink-500">{masuk ? "Dana masuk" : "Dana keluar"}</p>
          <p className={`font-display text-2xl font-bold ${masuk ? "text-brand-600" : "text-danger-600"}`}>
            {masuk ? "+" : "-"}
            {formatRupiah(Math.abs(t.nominal))}
          </p>
          <div className="mt-2">
            <Badge tone={mutasiBelumFinal(t.status) ? "warning" : "success"}>{t.status}</Badge>
          </div>
        </div>

        <dl className="divide-y divide-line rounded-lg border border-line text-xs">
          {[
            ["Deskripsi", t.deskripsi],
            ["Referensi", t.referensi],
            ["Kategori", t.kategori],
            ...(t.kategori === "Pencairan Kas" ? [["Rekening tujuan", `${rekening.bank} · ${rekening.nomor} a.n. ${rekening.atasNama}`]] : []),
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-3 py-2">
              <dt className="shrink-0 text-ink-500">{label}</dt>
              <dd className="text-right font-medium text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <PrintActions cetakLabel="Cetak / Simpan PDF">
        {idPesanan && (
          <Button variant="secondary" onClick={() => open({ type: "pesanan", id: idPesanan })}>
            Lihat Pesanan
          </Button>
        )}
      </PrintActions>
    </div>
  );
}

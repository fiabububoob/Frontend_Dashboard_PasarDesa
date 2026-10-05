"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/pesanan/StatusBadge";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useToast } from "@/components/ui/Toast";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { LATENSI } from "@/lib/constants";
import { simulateRequest } from "@/lib/fake-api";
import { cariKomoditasByNama } from "@/lib/stok";
import { formatRupiah } from "@/lib/format";
import { useDetail } from "./DetailProvider";

export function PesananContent({ id }: { id: string }) {
  const { pesanan, komoditas, siapkanPaket } = useDashboardData();
  const { push } = useDetail();
  const toast = useToast();
  const { status, run } = useActionStatus(900);
  const p = pesanan.find((x) => x.id === id);

  if (!p) return <p className="text-sm text-ink-500">Pesanan tidak ditemukan.</p>;

  async function handleSiapkan() {
    const ok = await run(() => simulateRequest(LATENSI.normal));
    if (ok && p) {
      siapkanPaket(p.id);
      toast({ type: "success", title: "Paket siap di rak", description: `#${p.id} menunggu kurir desa.` });
    } else {
      toast({ type: "error", title: "Gagal menyiapkan paket", description: "Coba lagi sebentar lagi." });
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={p.status} />
        <Badge tone={p.metodeBayar === "QRIS" ? "info" : "neutral"}>{p.metodeBayar === "QRIS" ? "QRIS Lunas" : "COD Kasir"}</Badge>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-ink-500">Pemesan</dt>
          <dd className="font-medium text-ink-900">{p.pembeli}</dd>
          <dd className="text-xs text-ink-500">{p.alamat}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Tujuan Drop-Point</dt>
          <dd className="font-medium text-ink-900">{p.dropPoint}</dd>
        </div>
      </dl>

      <div>
        <p className="text-xs font-medium uppercase text-ink-400">Komoditas</p>
        <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
          {p.items.map((item) => {
            const k = cariKomoditasByNama(komoditas, item.komoditas);
            return (
              <li key={item.komoditas} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div>
                  {k ? (
                    <button type="button" onClick={() => push({ type: "komoditas", id: k.id })} className="text-left font-medium text-brand-700 hover:underline">
                      {item.komoditas}
                    </button>
                  ) : (
                    <p className="font-medium text-ink-900">{item.komoditas}</p>
                  )}
                  <p className="text-xs text-ink-500">{item.jumlah}</p>
                </div>
                <p className="font-medium text-ink-900">{formatRupiah(item.subtotal)}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex justify-between font-semibold text-ink-900">
          <span>Total</span>
          <span className="text-brand-600">{formatRupiah(p.total)}</span>
        </div>
      </div>

      {p.catatan && <p className="rounded-lg bg-surface-muted p-3 text-xs italic text-ink-500">&ldquo;{p.catatan}&rdquo;</p>}

      {p.kurir && (
        <div className="rounded-lg border border-line p-3 text-xs">
          <p className="font-medium text-ink-900">{p.kurir.nama}</p>
          <p className="text-ink-500">{p.kurir.armada}</p>
          <p className="text-ink-500">Jemput: {p.kurir.jadwal}</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Link
          href="/pesanan"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
        >
          <ExternalLink className="h-4 w-4" />
          Buka di Pesanan
        </Link>
        {p.status === "perlu-dikemas" && (
          <Button status={status} loadingLabel="Menyiapkan…" errorLabel="Coba lagi" onClick={handleSiapkan}>
            Siapkan Paket
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Download, Inbox, SearchX, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FilterPills } from "@/components/ui/FilterPills";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { stagger } from "@/lib/motion";
import { formatRupiah } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { KAS_KATEGORI } from "@/lib/data/kas";
import { mutasiBelumFinal } from "@/lib/kas";
import { usePaginasi } from "@/lib/hooks/usePaginasi";
import { cocokSemuaKata } from "@/lib/text";
import { PERIODE_LAPORAN } from "@/lib/constants";
import type { TransaksiKas } from "@/types";

const KATEGORI_TONE: Record<TransaksiKas["kategori"], "success" | "warning" | "info"> = {
  "Penjualan Lapak": "success",
  "Pencairan Kas": "warning",
  "Subsidi Desa": "info",
};

const SEMUA = "Semua";

export function TransaksiTable() {
  const { transaksi } = useDashboardData();
  const { open } = useDetail();
  const toast = useToast();

  const [kategori, setKategori] = useState(SEMUA);
  const [query, setQuery] = useState("");

  const filterOptions = useMemo(
    () => [{ label: SEMUA, count: transaksi.length }, ...KAS_KATEGORI.map((k) => ({ label: k as string, count: transaksi.filter((t) => t.kategori === k).length }))],
    [transaksi],
  );

  const hasil = useMemo(
    () =>
      transaksi.filter((t) => {
        if (kategori !== SEMUA && t.kategori !== kategori) return false;
        return cocokSemuaKata(query, t.deskripsi, t.referensi, t.kategori, t.status, t.tanggal, t.id);
      }),
    [transaksi, kategori, query],
  );

  const { halaman, totalHalaman, itemHalaman: tampil, setHalaman } = usePaginasi(hasil, `${kategori}|${query}`);
  const adaFilter = kategori !== SEMUA || query.trim() !== "";

  // CSV (pemisah koma, BOM UTF-8) langsung terbuka di Excel. Mengekspor hasil
  // yang sedang difilter, bukan hanya halaman yang tampil.
  function unduhExcel() {
    downloadCsv("riwayat-kas-oktober-2026.csv", [
      ["ID", "Tanggal", "Waktu", "Deskripsi", "Referensi", "Kategori", "Nominal", "Status"],
      ...hasil.map((t) => [t.id, t.tanggal, t.waktu, t.deskripsi, t.referensi, t.kategori, t.nominal, t.status]),
    ]);
    toast({ type: "success", title: "Riwayat kas diunduh", description: `${hasil.length} mutasi → riwayat-kas-oktober-2026.csv (bisa dibuka di Excel)` });
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col justify-between gap-3 px-6 pb-4 pt-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-brand-600">Buku kas</p>
          <h3 className="font-display text-xl font-bold text-ink-900">Riwayat Mutasi &amp; Transaksi</h3>
        </div>
        <Button variant="secondary" size="sm" onClick={unduhExcel} disabled={hasil.length === 0}>
          <Download className="h-3.5 w-3.5" />
          Unduh Excel
        </Button>
      </div>

      <div className="space-y-4 px-6 pb-5">
        <FilterPills options={filterOptions} active={kategori} onChange={setKategori} />
        <div className="relative">
                    <input
            type="search"
            aria-label="Cari transaksi"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari deskripsi, invoice, atau tanggal…"
            className="w-full rounded-xl border border-line bg-white py-3 pl-4 pr-8 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" aria-label="Hapus pencarian" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-700">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {hasil.length === 0 ? (
        <EmptyState
          icon={adaFilter ? SearchX : Inbox}
          title={adaFilter ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi bulan ini"}
          description={adaFilter ? "Coba ubah kata kunci atau pilih kategori lain." : "Mutasi kas akan muncul di sini setelah ada penjualan atau pencairan dana."}
          action={
            adaFilter ? (
              <button
                type="button"
                onClick={() => {
                  setKategori(SEMUA);
                  setQuery("");
                }}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Reset filter
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-y border-line bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-3 py-3">Deskripsi &amp; Referensi</th>
                <th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3">Nominal</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tampil.map((trx, index) => (
                <tr key={trx.id} className="animate-fade-in" style={stagger(index)}>
                  <td className="px-5 py-4 text-ink-700">
                    <p className="font-bold text-ink-900">{trx.tanggal}</p>
                    <p className="text-xs text-ink-500">{trx.waktu}</p>
                  </td>
                  <td className="px-3 py-4">
                    <button type="button" onClick={() => open({ type: "transaksi", id: trx.id })} className="text-left">
                      <span className="block font-bold text-ink-900 hover:text-brand-700">{trx.deskripsi}</span>
                      <span className="block text-xs text-ink-500">{trx.referensi}</span>
                    </button>
                  </td>
                  <td className="px-3 py-4">
                    <Badge tone={KATEGORI_TONE[trx.kategori]}>{trx.kategori}</Badge>
                  </td>
                  <td className={`whitespace-nowrap px-3 py-4 font-bold ${trx.nominal < 0 ? "text-rupiah" : "text-brand-700"}`}>
                    {trx.nominal < 0 ? "-" : "+"}
                    {formatRupiah(Math.abs(trx.nominal))}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={mutasiBelumFinal(trx.status) ? "warning" : /Ditransfer|Dicairkan/.test(trx.status) ? "neutral" : "success"}>{trx.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasil.length > 0 && (
        <Pagination showing={tampil.length} total={hasil.length} currentPage={halaman} totalPages={totalHalaman} itemLabel={`transaksi bulan ${PERIODE_LAPORAN}`} onPageChange={setHalaman} />
      )}
    </Card>
  );
}

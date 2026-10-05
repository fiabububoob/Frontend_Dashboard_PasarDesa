"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { FilterPills } from "@/components/ui/FilterPills";
import { Pagination } from "@/components/ui/Pagination";
import { KomoditasTable } from "@/components/komoditas/KomoditasTable";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { KATEGORI_KOMODITAS } from "@/lib/data/komoditas";
import { usePaginasi } from "@/lib/hooks/usePaginasi";
import { statKomoditas } from "@/lib/stats";
import { cocokSemuaKata } from "@/lib/text";
import type { Komoditas } from "@/types";

const SEMUA = "Semua Hasil Tani";

type StatusFilter = "semua" | Komoditas["statusStok"];

// Semua yang ada di halaman ini (statistik, filter, pencarian, paginasi, toggle)
// dibaca dari data hidup, jadi menambah/mengubah komoditas langsung terlihat.
export function KomoditasWorkspace() {
  const { komoditas } = useDashboardData();
  const { open } = useDetail();

  const [kategori, setKategori] = useState(SEMUA);
  const [status, setStatus] = useState<StatusFilter>("semua");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => statKomoditas(komoditas), [komoditas]);

  const filterKategori = useMemo(
    () => [
      { label: SEMUA, count: komoditas.length },
      ...KATEGORI_KOMODITAS.map((nama) => ({ label: nama as string, count: komoditas.filter((k) => k.kategori === nama).length })),
    ],
    [komoditas],
  );

  const hasil = useMemo(
    () =>
      komoditas.filter((k) => {
        if (kategori !== SEMUA && k.kategori !== kategori) return false;
        if (status !== "semua" && k.statusStok !== status) return false;
        return cocokSemuaKata(query, k.nama, k.sku, k.kategori, k.asalBlok, k.tag, k.hargaKeterangan);
      }),
    [komoditas, kategori, status, query],
  );

  const { halaman, totalHalaman, itemHalaman: tampil, setHalaman } = usePaginasi(hasil, `${kategori}|${status}|${query}`);
  const adaFilter = kategori !== SEMUA || status !== "semua" || query.trim() !== "";

  function reset() {
    setKategori(SEMUA);
    setStatus("semua");
    setQuery("");
  }

  return (
    <>
      <PageHeader
        title="Komoditas"
        description="Pantau stok, harga, dan jadwal panen semua komoditas di satu tempat."
        actions={
          <>
            <Button variant="secondary" onClick={() => open({ type: "impor-ekspor" })}>
              <Download className="h-4 w-4" />
              Import / Ekspor Data
            </Button>
            <Button variant="primary" onClick={() => open({ type: "form-komoditas" })}>
              <Plus className="h-4 w-4" />
              Tambah Komoditas Panen
            </Button>
          </>
        }
      />

      <StatCardGrid stats={stats} />

      <div className="space-y-3">
        <FilterPills options={filterKategori} active={kategori} onChange={setKategori} />

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              aria-label="Cari komoditas"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, SKU, asal blok, atau label…"
              className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-8 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" aria-label="Hapus pencarian" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-700">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            aria-label="Filter status stok"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="semua">Semua status stok</option>
            <option value="aman">Stok aman</option>
            <option value="menengah">Stok menengah</option>
            <option value="kritis">Stok kritis</option>
          </select>

          {adaFilter && (
            <Button variant="ghost" onClick={reset}>
              Reset filter
            </Button>
          )}
        </div>
      </div>

      <KomoditasTable
        data={tampil}
        emptyTitle={adaFilter ? "Tidak ada komoditas yang cocok" : undefined}
        emptyDescription={adaFilter ? "Coba ubah kata kunci atau reset filter." : undefined}
      />
      {hasil.length > 0 && (
        <Pagination showing={tampil.length} total={hasil.length} currentPage={halaman} totalPages={totalHalaman} itemLabel="komoditas hasil panen" onPageChange={setHalaman} />
      )}
    </>
  );
}

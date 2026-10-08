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
import { KATEGORI_INDUK } from "@/lib/data/kategori";
import { usePaginasi } from "@/lib/hooks/usePaginasi";
import { indukDari, subDariInduk } from "@/lib/kategori";
import { statKomoditas } from "@/lib/stats";
import { cocokSemuaKata } from "@/lib/text";
import type { Komoditas } from "@/types";

const SEMUA = "Semua";

type StatusFilter = "semua" | Komoditas["statusStok"];

// Semua yang ada di halaman ini (statistik, filter, pencarian, paginasi, toggle)
// dibaca dari data hidup, jadi menambah/mengubah komoditas langsung terlihat.
// Filter kategori dua tingkat: pilih kategori besar dulu, lalu (opsional) sub-kategorinya.
export function KomoditasWorkspace() {
  const { komoditas } = useDashboardData();
  const { open } = useDetail();

  const [induk, setInduk] = useState(SEMUA);
  const [sub, setSub] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>("semua");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => statKomoditas(komoditas), [komoditas]);

  const hitungSub = (nama: string) => komoditas.filter((k) => k.kategori === nama).length;
  const hitungInduk = (nama: string) => subDariInduk(nama).reduce((total, s) => total + hitungSub(s), 0);

  const opsiInduk = [{ label: SEMUA, count: komoditas.length }, ...KATEGORI_INDUK.map((i) => ({ label: i.nama, count: hitungInduk(i.nama) }))];

  // Baris kedua (sub-kategori) hanya muncul bila kategori besar yang dipilih punya lebih dari satu sub.
  const daftarSub = induk === SEMUA ? [] : subDariInduk(induk);
  const labelSemuaSub = `Semua ${induk}`;
  const opsiSub = [{ label: labelSemuaSub, count: hitungInduk(induk) }, ...daftarSub.map((nama) => ({ label: nama, count: hitungSub(nama) }))];

  const hasil = useMemo(
    () =>
      komoditas.filter((k) => {
        if (sub !== null && k.kategori !== sub) return false;
        if (sub === null && induk !== SEMUA && !subDariInduk(induk).includes(k.kategori)) return false;
        if (status !== "semua" && k.statusStok !== status) return false;
        return cocokSemuaKata(query, k.nama, k.sku, k.kategori, indukDari(k.kategori)?.nama, k.asalBlok, k.tag, k.hargaKeterangan);
      }),
    [komoditas, induk, sub, status, query],
  );

  const { halaman, totalHalaman, itemHalaman: tampil, setHalaman } = usePaginasi(hasil, `${induk}|${sub}|${status}|${query}`);
  const adaFilter = induk !== SEMUA || status !== "semua" || query.trim() !== "";

  function pilihInduk(label: string) {
    setInduk(label);
    setSub(null); // ganti kategori besar → sub-kategori di-reset
  }

  function reset() {
    pilihInduk(SEMUA);
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
        <FilterPills options={opsiInduk} active={induk} onChange={pilihInduk} />
        {daftarSub.length > 1 && <FilterPills options={opsiSub} active={sub ?? labelSemuaSub} onChange={(label) => setSub(label === labelSemuaSub ? null : label)} />}

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
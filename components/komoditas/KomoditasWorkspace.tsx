"use client";

import { useMemo, useState } from "react";
import { Download, LayoutGrid, List, Plus, X } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import { Pagination } from "@/components/ui/Pagination";
import { KomoditasList } from "@/components/komoditas/KomoditasList";
import { KomoditasGrid } from "@/components/komoditas/KomoditasGrid";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { KATEGORI_INDUK } from "@/lib/data/kategori";
import { hitungStatusTampilan, indukNama, statusTampilan, type StatusTampilan } from "@/lib/komoditas";
import { usePaginasi } from "@/lib/hooks/usePaginasi";
import { cocokSemuaKata } from "@/lib/text";

const UKURAN_HALAMAN_KOMODITAS = 8;
const TAB_SEMUA = "Semua";
const TAB_STATUS: { label: string; status: StatusTampilan }[] = [
  { label: "Aktif", status: "aktif" },
  { label: "Stok Rendah", status: "stok-rendah" },
  { label: "Nonaktif", status: "nonaktif" },
];
const FILTER = "min-w-[11rem] shrink-0 !py-2.5";

type Tampilan = "list" | "grid";

// Halaman daftar komoditas: tab status, toolbar filter, tampilan daftar/kartu. Semua dihitung dari
// data hidup, jadi menambah/mengubah komoditas langsung terlihat di tab dan hitungannya.
export function KomoditasWorkspace() {
  const { komoditas, statusKomoditas, galatKomoditas, muatKomoditas } = useDashboardData();
  const { open } = useDetail();

  const [tab, setTab] = useState(TAB_SEMUA);
  const [query, setQuery] = useState("");
  const [induk, setInduk] = useState("");
  const [tampilan, setTampilan] = useState<Tampilan>("list");
  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());

  const statusAktif = TAB_STATUS.find((t) => t.label === tab)?.status;

  const hasil = useMemo(
    () =>
      komoditas.filter((k) => {
        if (statusAktif && statusTampilan(k) !== statusAktif) return false;
        if (induk && indukNama(k) !== induk) return false;
        return cocokSemuaKata(query, k.nama, k.sku, k.kategori, indukNama(k), k.asalBlok, k.tag);
      }),
    [komoditas, statusAktif, induk, query],
  );

  const { halaman, totalHalaman, itemHalaman: tampil, setHalaman } = usePaginasi(hasil, `${tab}|${query}|${induk}`, UKURAN_HALAMAN_KOMODITAS);
  const adaFilter = tab !== TAB_SEMUA || query.trim() !== "" || induk !== "";

  const tabs = [{ label: TAB_SEMUA, count: komoditas.length }, ...TAB_STATUS.map((t) => ({ label: t.label, count: hitungStatusTampilan(komoditas, t.status) }))];

  function ubahPilihan(id: string, pilih: boolean) {
    setTerpilih((s) => {
      const n = new Set(s);
      if (pilih) n.add(id);
      else n.delete(id);
      return n;
    });
  }
  function pilihSemua(pilih: boolean) {
    setTerpilih((s) => {
      const n = new Set(s);
      tampil.forEach((k) => (pilih ? n.add(k.id) : n.delete(k.id)));
      return n;
    });
  }
  function reset() {
    setTab(TAB_SEMUA);
    setQuery("");
    setInduk("");
  }

  const toggleBtn = (nilai: Tampilan, Ikon: typeof List, label: string) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={tampilan === nilai}
      onClick={() => setTampilan(nilai)}
      className={clsx("flex h-10 w-10 items-center justify-center transition-colors duration-feedback ease-enter", tampilan === nilai ? "bg-[#DDF5E5] text-brand-700" : "bg-white text-ink-500 hover:bg-surface-muted")}
    >
      <Ikon className="h-4 w-4" />
    </button>
  );

  return (
    <>
      <PageHeader
        eyebrow="Komoditas"
        title="Daftar Komoditas"
        description="Kelola data komoditas pertanian dan produk BUMDes."
        actions={
          <>
            <Button variant="secondary" size="md" onClick={() => open({ type: "impor-ekspor" })}>
              <Download className="h-4 w-4" />
              Import / Ekspor
            </Button>
            <Button variant="primary" onClick={() => open({ type: "form-komoditas" })}>
              <Plus className="h-4 w-4" />
              Tambah Komoditas
            </Button>
          </>
        }
      />

      {statusKomoditas === "gagal" && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn-400/40 bg-[#FFF6DB] px-4 py-3 text-sm text-[#7A4B00]">
          <p>
            <span className="font-semibold">Data komoditas belum tersambung ke server.</span> Yang tampil adalah data contoh{galatKomoditas ? ` (${galatKomoditas})` : ""}. Perubahan tidak bisa disimpan sementara.
          </p>
          <Button variant="secondary" size="sm" onClick={() => void muatKomoditas()}>
            Coba lagi
          </Button>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <UnderlineTabs options={tabs} active={tab} onChange={setTab} />

        <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-5">
          <input
            type="search"
            aria-label="Cari komoditas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama komoditas..."
            className="min-w-[12rem] flex-1 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 [&::-webkit-search-cancel-button]:hidden"
          />
          <Select aria-label="Filter kategori" fullWidth={false} className={FILTER} value={induk} onChange={(e) => setInduk(e.target.value)}>
            <option value="">Semua Kategori</option>
            {KATEGORI_INDUK.map((k) => (
              <option key={k.id}>{k.nama}</option>
            ))}
          </Select>
          <div className="flex shrink-0 overflow-hidden rounded-xl border border-line">
            {toggleBtn("grid", LayoutGrid, "Tampilan kartu")}
            {toggleBtn("list", List, "Tampilan daftar")}
          </div>
        </div>

        {induk !== "" && (
          <div className="flex flex-wrap items-center gap-3 px-5 pb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900">
              {induk}
              <button type="button" aria-label={`Hapus filter kategori ${induk}`} onClick={() => setInduk("")} className="rounded-full p-0.5 text-brand-700 transition-colors duration-feedback ease-enter hover:bg-brand-100">
                <X className="h-3 w-3" />
              </button>
            </span>
            <button type="button" onClick={reset} className="text-xs font-medium text-ink-500 underline underline-offset-2 hover:text-ink-900">
              Reset filter
            </button>
          </div>
        )}

        {(() => {
          const kosongJudul = adaFilter ? "Tidak ada komoditas yang cocok" : undefined;
          const kosongDeskripsi = adaFilter ? "Coba ubah kata kunci atau reset filter." : undefined;
          return tampilan === "list" ? (
            <KomoditasList data={tampil} terpilih={terpilih} onPilih={ubahPilihan} onPilihSemua={pilihSemua} emptyTitle={kosongJudul} emptyDescription={kosongDeskripsi} />
          ) : (
            <KomoditasGrid data={tampil} emptyTitle={kosongJudul} emptyDescription={kosongDeskripsi} />
          );
        })()}

        {adaFilter && hasil.length === 0 && (
          <div className="px-5 pb-5 text-center">
            <Button variant="ghost" onClick={reset}>
              Reset filter
            </Button>
          </div>
        )}
        <Pagination showing={tampil.length} total={hasil.length} currentPage={halaman} totalPages={totalHalaman} itemLabel="komoditas" pageSize={UKURAN_HALAMAN_KOMODITAS} onPageChange={setHalaman} />
      </Card>
    </>
  );
}

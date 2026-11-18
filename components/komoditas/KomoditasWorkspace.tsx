"use client";

import { useMemo, useState } from "react";
import { Download, LayoutGrid, List, Plus } from "lucide-react";
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
import { LABEL_JENIS_SUMBER, OPSI_KETERSEDIAAN } from "@/lib/data/komoditasOpsi";
import { ketersediaanDari, hitungStatusTampilan, indukNama, LABEL_STATUS_TAMPILAN, penjualDari, statusTampilan, sumberDari, type StatusTampilan } from "@/lib/komoditas";
import { usePaginasi } from "@/lib/hooks/usePaginasi";
import { cocokSemuaKata } from "@/lib/text";

const UKURAN_HALAMAN_KOMODITAS = 8;
const TAB_SEMUA = "Semua";
const TAB_STATUS: { label: string; status: StatusTampilan }[] = [
  { label: "Aktif", status: "aktif" },
  { label: "Stok Rendah", status: "stok-rendah" },
  { label: "Nonaktif", status: "nonaktif" },
];
const FILTER = "w-auto min-w-[9.5rem] flex-1 sm:flex-none";

type Tampilan = "list" | "grid";

// Halaman daftar komoditas: tab status, toolbar filter, tampilan daftar/kartu. Semua dihitung dari
// data hidup, jadi menambah/mengubah komoditas langsung terlihat di tab dan hitungannya.
export function KomoditasWorkspace() {
  const { komoditas } = useDashboardData();
  const { open } = useDetail();

  const [tab, setTab] = useState(TAB_SEMUA);
  const [query, setQuery] = useState("");
  const [induk, setInduk] = useState("");
  const [sumber, setSumber] = useState("");
  const [ketersediaan, setKetersediaan] = useState("");
  const [tampilan, setTampilan] = useState<Tampilan>("list");
  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());

  const statusAktif = TAB_STATUS.find((t) => t.label === tab)?.status;

  const hasil = useMemo(
    () =>
      komoditas.filter((k) => {
        if (statusAktif && statusTampilan(k) !== statusAktif) return false;
        if (induk && indukNama(k) !== induk) return false;
        if (sumber && sumberDari(k) !== sumber) return false;
        if (ketersediaan && ketersediaanDari(k) !== ketersediaan) return false;
        return cocokSemuaKata(query, k.nama, k.sku, k.kategori, indukNama(k), penjualDari(k), k.tag);
      }),
    [komoditas, statusAktif, induk, sumber, ketersediaan, query],
  );

  const { halaman, totalHalaman, itemHalaman: tampil, setHalaman } = usePaginasi(hasil, `${tab}|${query}|${induk}|${sumber}|${ketersediaan}`, UKURAN_HALAMAN_KOMODITAS);
  const adaFilter = tab !== TAB_SEMUA || query.trim() !== "" || induk !== "" || sumber !== "" || ketersediaan !== "";

  const tabs = [{ label: TAB_SEMUA, count: komoditas.length }, ...TAB_STATUS.map((t) => ({ label: t.label, count: hitungStatusTampilan(komoditas, t.status) }))];
  const opsiKetersediaan = Array.from(new Set([...OPSI_KETERSEDIAAN, ...komoditas.map(ketersediaanDari)]));

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
    setSumber("");
    setKetersediaan("");
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

      <Card className="overflow-hidden p-0">
        <UnderlineTabs options={tabs} active={tab} onChange={setTab} />

        <div className="flex flex-wrap items-center gap-3 p-5">
          <input
            type="search"
            aria-label="Cari komoditas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama komoditas..."
            className="min-w-[12rem] flex-1 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:max-w-[13rem] [&::-webkit-search-cancel-button]:hidden"
          />
          <Select aria-label="Filter kategori" className={FILTER} value={induk} onChange={(e) => setInduk(e.target.value)}>
            <option value="">Semua Kategori</option>
            {KATEGORI_INDUK.map((k) => (
              <option key={k.id}>{k.nama}</option>
            ))}
          </Select>
          <Select aria-label="Filter sumber" className={FILTER} value={sumber} onChange={(e) => setSumber(e.target.value)}>
            <option value="">Semua Sumber</option>
            {LABEL_JENIS_SUMBER.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select aria-label="Filter status" className={FILTER} value={statusAktif ?? ""} onChange={(e) => setTab(TAB_STATUS.find((t) => t.status === e.target.value)?.label ?? TAB_SEMUA)}>
            <option value="">Semua Status</option>
            {TAB_STATUS.map((t) => (
              <option key={t.status} value={t.status}>
                {LABEL_STATUS_TAMPILAN[t.status]}
              </option>
            ))}
          </Select>
          <Select aria-label="Filter ketersediaan" className={FILTER} value={ketersediaan} onChange={(e) => setKetersediaan(e.target.value)}>
            <option value="">Semua Ketersediaan</option>
            {opsiKetersediaan.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
          <div className="ml-auto flex overflow-hidden rounded-xl border border-line">
            {toggleBtn("grid", LayoutGrid, "Tampilan kartu")}
            {toggleBtn("list", List, "Tampilan daftar")}
          </div>
        </div>

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

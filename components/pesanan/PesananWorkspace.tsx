"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { FilterPills } from "@/components/ui/FilterPills";
import { Pagination } from "@/components/ui/Pagination";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { INTERVAL_REFRESH_DATA_MS } from "@/lib/constants";
import { formatJam } from "@/lib/format";
import { usePaginasi } from "@/lib/hooks/usePaginasi";
import { labelPembayaran, pesananDiTab, STATUS_LABEL } from "@/lib/pesanan";
import { statPesanan } from "@/lib/stats";
import { stagger } from "@/lib/motion";
import { cocokSemuaKata } from "@/lib/text";
import { formatRupiah } from "@/lib/format";
import { PESANAN_TABS } from "@/lib/data/pesanan";
import { StatusBadge } from "./StatusBadge";

const TAB_AWAL = "Semua";
const UKURAN_HALAMAN_PESANAN = 6;

// Halaman Pesanan: statistik, tab status, pencarian, dan tabel. Semua angka dihitung dari data hidup,
// jadi mengubah status pesanan (di panel detail) langsung mengubah statistik, jumlah di tab, dan badge sidebar.
export function PesananWorkspace() {
  const { pesanan } = useDashboardData();
  const { open } = useDetail();

  const [tab, setTab] = useState(TAB_AWAL);
  const [query, setQuery] = useState("");
  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());
  const [diperbarui, setDiperbarui] = useState<Date | null>(null);

  // Auto-update 30 detik. Belum ada backend, jadi hanya cap waktu yang diperbarui.
  useEffect(() => {
    setDiperbarui(new Date());
    const t = setInterval(() => setDiperbarui(new Date()), INTERVAL_REFRESH_DATA_MS);
    return () => clearInterval(t);
  }, []);

  const tabAktif = PESANAN_TABS.find((t) => t.label === tab) ?? PESANAN_TABS[0];
  const hasil = useMemo(
    () => pesananDiTab(pesanan, tabAktif).filter((p) => cocokSemuaKata(query, p.id, p.pembeli, p.alamat, p.dropPoint, STATUS_LABEL[p.status], ...p.items.map((i) => i.komoditas))),
    [pesanan, tabAktif, query],
  );
  const { halaman, totalHalaman, itemHalaman: tampil, setHalaman } = usePaginasi(hasil, `${tab}|${query}`, UKURAN_HALAMAN_PESANAN);
  const stats = useMemo(() => statPesanan(pesanan), [pesanan]);
  const jam = diperbarui ? formatJam(diperbarui, true) : "";
  const semuaTerpilih = tampil.length > 0 && tampil.every((p) => terpilih.has(p.id));

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
      tampil.forEach((p) => (pilih ? n.add(p.id) : n.delete(p.id)));
      return n;
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Pesanan"
        title="Pesanan"
        description="Siapkan dan lacak pesanan sebelum dijemput kurir desa."
        actions={
          <div className="flex items-center gap-4">
            <p className="text-sm text-ink-500" aria-live="polite">
              {jam && `Diperbarui ${jam} WIB`}
            </p>
            <Button variant="secondary" className="border-brand-600 text-brand-700" onClick={() => open({ type: "surat-jalan" })}>
              Cetak Surat Jalan
            </Button>
          </div>
        }
      />

      <StatCardGrid stats={stats} columns={3} />

      <Card className="overflow-hidden p-0">
        <div className="space-y-4 p-6 pb-5">
          <FilterPills options={PESANAN_TABS.map((t) => ({ label: t.label, count: pesananDiTab(pesanan, t).length }))} active={tab} onChange={setTab} />
          <input
            type="search"
            aria-label="Cari pesanan"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama pembeli, nomor pesanan, atau komoditas..."
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        {hasil.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={query.trim() ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}
            description={query.trim() ? "Tidak ada pesanan yang cocok dengan pencarian ini." : "Tidak ada pesanan di kategori ini."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-y border-line bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  <th className="w-12 py-3 pl-6">
                    <input type="checkbox" aria-label="Pilih semua pesanan" checked={semuaTerpilih} onChange={(e) => pilihSemua(e.target.checked)} className="h-4 w-4 rounded border-line accent-brand-600" />
                  </th>
                  <th className="px-3 py-3">Pesanan</th>
                  <th className="px-3 py-3">Pembeli</th>
                  <th className="px-3 py-3">Pembayaran</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tampil.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in align-middle" style={stagger(i)}>
                    <td className="py-4 pl-6">
                      <input type="checkbox" aria-label={`Pilih pesanan ${p.id}`} checked={terpilih.has(p.id)} onChange={(e) => ubahPilihan(p.id, e.target.checked)} className="h-4 w-4 rounded border-line accent-brand-600" />
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-bold text-ink-900">#{p.id}</p>
                      <p className="text-xs text-ink-500">{p.waktu}</p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-bold text-ink-900">{p.pembeli}</p>
                      <p className="text-xs text-ink-500">{p.alamat}</p>
                    </td>
                    <td className="px-3 py-4 text-ink-900">{labelPembayaran(p)}</td>
                    <td className="whitespace-nowrap px-3 py-4 font-bold text-ink-900">{formatRupiah(p.total)}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => open({ type: "pesanan", id: p.id })} className="text-sm font-bold text-brand-600 hover:underline">
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination showing={tampil.length} total={hasil.length} currentPage={halaman} totalPages={totalHalaman} itemLabel="pesanan" pageSize={UKURAN_HALAMAN_PESANAN} onPageChange={setHalaman} />
      </Card>
    </>
  );
}

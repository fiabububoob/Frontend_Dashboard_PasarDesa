"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, RefreshCcw, Printer } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { FilterPills } from "@/components/ui/FilterPills";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { simulateRequest } from "@/lib/fake-api";
import { INTERVAL_REFRESH_DATA_MS, LATENSI } from "@/lib/constants";
import { formatJam } from "@/lib/format";
import { hitungStatus, perluDijemput } from "@/lib/pesanan";
import { statPesanan } from "@/lib/stats";
import { PESANAN_TABS } from "@/lib/data/pesanan";
import { PesananList } from "./PesananList";
import { PesananDetail } from "./PesananDetail";

const TAB_AWAL = "Perlu Disiapkan / Dikemas";

// Seluruh halaman Pesanan: statistik, tab status, daftar, dan detail. Semua
// angka dihitung dari data hidup, jadi menandai paket siap/dijemput/tiba
// langsung mengubah statistik, jumlah di tab, dan badge di sidebar.
export function PesananWorkspace() {
  const { pesanan } = useDashboardData();
  const { open } = useDetail();
  const toast = useToast();
  const { status: refreshStatus, run: runRefresh } = useActionStatus(600);

  const [tab, setTab] = useState(TAB_AWAL);
  const [selectedId, setSelectedId] = useState("");
  const [diperbarui, setDiperbarui] = useState<Date | null>(null);

  const tabAktif = PESANAN_TABS.find((t) => t.label === tab) ?? PESANAN_TABS[0];
  const filtered = useMemo(() => (tabAktif.key === "semua" ? pesanan : pesanan.filter((p) => p.status === tabAktif.key)), [pesanan, tabAktif]);

  // Auto-update 30 detik. Belum ada backend, jadi "memuat ulang" hanya
  // memperbarui cap waktu; ganti isi fetchTerbaru() dengan panggilan API nanti.
  async function fetchTerbaru() {
    await simulateRequest(LATENSI.cepat);
    setDiperbarui(new Date());
  }
  useEffect(() => {
    setDiperbarui(new Date());
    const t = setInterval(() => setDiperbarui(new Date()), INTERVAL_REFRESH_DATA_MS);
    return () => clearInterval(t);
  }, []);

  async function handleRefresh() {
    const ok = await runRefresh(fetchTerbaru);
    if (ok) toast({ type: "success", title: "Data pesanan diperbarui", description: `${pesanan.length} pesanan dimuat.` });
    else toast({ type: "error", title: "Gagal memuat data", description: "Periksa koneksi lalu coba lagi." });
  }

  // Pilih pesanan pertama saat tab berganti atau pilihan awal belum ada.
  useEffect(() => {
    if (!filtered.some((p) => p.id === selectedId) && !pesanan.some((p) => p.id === selectedId && selectedId !== "")) {
      setSelectedId(filtered[0]?.id ?? "");
    }
  }, [filtered, selectedId, pesanan]);

  function gantiTab(label: string) {
    setTab(label);
    const t = PESANAN_TABS.find((x) => x.label === label);
    const list = !t || t.key === "semua" ? pesanan : pesanan.filter((p) => p.status === t.key);
    setSelectedId(list[0]?.id ?? "");
  }

  const hitung = (key: (typeof PESANAN_TABS)[number]["key"]) => (key === "semua" ? pesanan.length : hitungStatus(pesanan, key));
  const selected = pesanan.find((p) => p.id === selectedId);
  const jumlahSuratJalan = pesanan.filter(perluDijemput).length;

  const stats = useMemo(() => statPesanan(pesanan), [pesanan]);

  const jam = diperbarui ? formatJam(diperbarui, true) : "";

  return (
    <>
      <StatCardGrid stats={stats} />

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Pesanan"
            description="Siapkan dan lacak pesanan sebelum dijemput kurir desa."
          />
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex gap-2">
              <Button variant="secondary" status={refreshStatus} loadingLabel="Memuat…" successLabel="Diperbarui" onClick={handleRefresh}>
                <RefreshCcw className="h-4 w-4" />
                Refresh Data (Auto-update 30s)
              </Button>
              <Button variant="primary" onClick={() => open({ type: "surat-jalan" })}>
                <Printer className="h-4 w-4" />
                Cetak Semua Surat Jalan
              </Button>
            </div>
            <p className="text-[11px] text-ink-400" aria-live="polite">
              {jam && `Terakhir diperbarui ${jam} WIB`}
              {jam && jumlahSuratJalan > 0 && ` · ${jumlahSuratJalan} paket di surat jalan`}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <FilterPills options={PESANAN_TABS.map((t) => ({ label: t.label, count: hitung(t.key) }))} active={tab} onChange={gantiTab} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PesananList judul={tabAktif.key === "semua" ? "Daftar Semua Pesanan" : `Daftar ${tabAktif.label}`} data={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="lg:col-span-3">
          {selected ? (
            <PesananDetail pesanan={selected} />
          ) : (
            <Card className="p-5">
              <EmptyState icon={Inbox} title="Belum ada pesanan dipilih" description="Pilih pesanan di daftar untuk melihat rincian, kurir, dan tombol aksinya." />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

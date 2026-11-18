"use client";

import { useMemo, useState } from "react";
import { Camera, Inbox } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterPills } from "@/components/ui/FilterPills";
import { StatCardGrid } from "@/components/ui/StatCardGrid";
import { UnderlineTabs } from "@/components/ui/UnderlineTabs";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { useSekarang } from "@/lib/hooks/useSekarang";
import { lewatBatas } from "@/lib/aduanApi";
import { tanggalWib } from "@/lib/kasApi";
import { LABEL_ALASAN, nilaiRefund } from "@/lib/komplain";
import { usePaginasi } from "@/lib/hooks/usePaginasi";
import { formatRupiah } from "@/lib/format";
import type { Aduan, Pesanan } from "@/types";

const UKURAN = 8;
const JENIS = ["Semua", "Pesanan", "Tiket Aduan"] as const;
const STATUS = ["Semua", "Perlu Ditangani", "Diproses", "Selesai"] as const;
type StatusGabungan = "baru" | "proses" | "selesai";

// Dua sumber pengaduan digabung dalam satu daftar:
//  - Pesanan: komplain/retur atas pesanan (dana ditahan), diputuskan di detail pesanan.
//  - Tiket Aduan: aduan umum dari Pusat Bantuan aplikasi mobile (kurir, saldo, akun, dll.), dibalas di panel tiket.
type Baris =
  | { jenis: "Pesanan"; id: string; waktu: string; pembeli: string; topik: string; ringkas?: string; foto: number; status: StatusGabungan; pesanan: Pesanan }
  | { jenis: "Tiket Aduan"; id: string; waktu: string; pembeli: string; topik: string; ringkas?: string; foto: number; status: StatusGabungan; aduan: Aduan };

const TONE = { baru: "warning", proses: "info", selesai: "success" } as const;
const LABEL = { baru: "Perlu Ditangani", proses: "Diproses", selesai: "Selesai" } as const;
const STATUS_KE_GABUNGAN: Record<string, StatusGabungan | undefined> = { "Perlu Ditangani": "baru", Diproses: "proses", Selesai: "selesai" };

export function PengaduanWorkspace() {
  const { pesanan, statusPesanan, aduan, statusAduan, galatAduan, muatAduan } = useDashboardData();
  const { open } = useDetail();
  const sekarang = useSekarang();
  const [jenis, setJenis] = useState<string>("Semua");
  const [status, setStatus] = useState<string>("Semua");

  const semua = useMemo<Baris[]>(() => {
    const dariPesanan: Baris[] = pesanan
      .filter((p): p is Pesanan & { komplain: NonNullable<Pesanan["komplain"]> } => p.komplain !== undefined)
      .map((p) => ({
        jenis: "Pesanan" as const,
        id: p.id,
        waktu: p.komplain.diajukanPada,
        pembeli: p.pembeli,
        topik: LABEL_ALASAN[p.komplain.alasan],
        ringkas: p.komplain.items.map((i) => i.komoditas).join(", "),
        foto: p.komplain.foto.length,
        status: p.komplain.status === "diajukan" ? ("baru" as const) : p.komplain.status === "selesai" ? ("selesai" as const) : ("proses" as const),
        pesanan: p,
      }));
    const dariAduan: Baris[] = aduan.map((a) => ({
      jenis: "Tiket Aduan" as const,
      id: a.id,
      waktu: a.dibuatPada,
      pembeli: a.pembeli,
      topik: a.topik,
      ringkas: a.judul,
      foto: a.foto.length,
      status: a.status === "diverifikasi" ? ("baru" as const) : a.status === "selesai" ? ("selesai" as const) : ("proses" as const),
      aduan: a,
    }));
    return [...dariPesanan, ...dariAduan].sort((x, y) => new Date(y.waktu).getTime() - new Date(x.waktu).getTime());
  }, [pesanan, aduan]);

  const sesuaiJenis = (b: Baris) => jenis === "Semua" || b.jenis === jenis;
  const statusDipilih = STATUS_KE_GABUNGAN[status];
  const hasil = semua.filter((b) => sesuaiJenis(b) && (!statusDipilih || b.status === statusDipilih));
  const { halaman, totalHalaman, itemHalaman: tampil, setHalaman } = usePaginasi(hasil, `${jenis}|${status}`, UKURAN);

  const hitung = (s: StatusGabungan, j?: string) => semua.filter((b) => b.status === s && (!j || b.jenis === j)).length;
  const ditahan = pesanan.filter((p) => p.komplain && p.komplain.status !== "selesai").reduce((sum, p) => sum + p.total - nilaiRefund(p), 0);
  const telat = sekarang ? aduan.filter((a) => lewatBatas(a, sekarang)).length : 0;

  return (
    <>
      <PageHeader
        eyebrow="Pengaduan"
        title="Pengaduan Pembeli"
        description="Komplain pesanan dan tiket aduan dari Pusat Bantuan aplikasi. Tiket ditargetkan ditindaklanjuti dalam 1×24 jam."
      />

      {statusAduan === "gagal" && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn-400/40 bg-[#FFF6DB] px-4 py-3 text-sm text-[#7A4B00]">
          <p>
            <span className="font-semibold">Tiket aduan belum tersambung ke server.</span> Hanya komplain pesanan yang tampil{galatAduan ? ` (${galatAduan})` : ""}.
          </p>
          <Button variant="secondary" size="sm" onClick={() => void muatAduan()}>
            Coba lagi
          </Button>
        </div>
      )}

      <StatCardGrid
        columns={3}
        stats={[
          { id: "baru", label: "Perlu Ditangani", value: String(hitung("baru")), helper: `${hitung("baru", "Pesanan")} komplain pesanan · ${hitung("baru", "Tiket Aduan")} tiket` },
          { id: "proses", label: "Sedang Diproses", value: String(hitung("proses")), helper: telat > 0 ? `${telat} tiket lewat 1×24 jam` : "Semua tiket masih dalam target" },
          { id: "ditahan", label: "Dana Ditahan", value: formatRupiah(ditahan), helper: "Dari komplain pesanan yang belum selesai" },
        ]}
      />

      <Card className="overflow-hidden p-0">
        <UnderlineTabs options={JENIS.map((j) => ({ label: j, count: j === "Semua" ? semua.length : semua.filter((b) => b.jenis === j).length }))} active={jenis} onChange={setJenis} />
        <div className="px-5 pt-4">
          <FilterPills options={STATUS.map((s) => ({ label: s }))} active={status} onChange={setStatus} />
        </div>

        {hasil.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Belum ada pengaduan"
            description={statusPesanan === "gagal" ? "Data pesanan belum tersambung ke server." : "Pengaduan dari pembeli akan muncul di sini."}
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-y border-line bg-surface-muted text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-3 py-3">Jenis</th>
                  <th className="px-3 py-3">Pembeli</th>
                  <th className="px-3 py-3">Topik</th>
                  <th className="px-3 py-3">Foto</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tampil.map((b) => {
                  const { tanggal, waktu } = tanggalWib(b.waktu);
                  const terlambat = b.jenis === "Tiket Aduan" && sekarang ? lewatBatas(b.aduan, sekarang) : false;
                  return (
                    <tr key={`${b.jenis}-${b.id}`} className="align-middle">
                      <td className="px-6 py-4">
                        <p className="font-bold text-ink-900">#{b.id}</p>
                        <p className="text-xs text-ink-500">
                          {tanggal}, {waktu}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <Badge tone={b.jenis === "Pesanan" ? "neutral" : "info"}>{b.jenis}</Badge>
                      </td>
                      <td className="px-3 py-4 font-bold text-ink-900">{b.pembeli}</td>
                      <td className="max-w-[240px] px-3 py-4">
                        <p className="text-ink-900">{b.topik}</p>
                        {b.ringkas && <p className="truncate text-xs text-ink-500">{b.ringkas}</p>}
                      </td>
                      <td className="px-3 py-4 text-ink-700">
                        {b.foto > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Camera className="h-4 w-4 text-ink-400" aria-hidden />
                            {b.foto}
                          </span>
                        ) : (
                          <span className="text-ink-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <Badge tone={TONE[b.status]}>{LABEL[b.status]}</Badge>
                        {terlambat && <p className="mt-1 text-xs font-semibold text-danger-600">Lewat 1×24 jam</p>}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant={b.status === "baru" ? "primary" : "secondary"} size="sm" onClick={() => open(b.jenis === "Pesanan" ? { type: "pesanan", id: b.id } : { type: "aduan", id: b.id })}>
                          {b.status === "baru" ? "Tangani" : "Lihat"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination showing={tampil.length} total={hasil.length} currentPage={halaman} totalPages={totalHalaman} itemLabel="pengaduan" pageSize={UKURAN} onPageChange={setHalaman} />
      </Card>
    </>
  );
}

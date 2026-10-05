"use client";

import { CalendarDays, Mountain } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Toggle } from "@/components/ui/Toggle";
import { fieldClass } from "@/components/ui/formStyles";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { STATUS_JADWAL_LABEL } from "@/lib/pengaturan";
import { usePengaturanForm } from "./PengaturanForm";
import type { JadwalOperasional, StatusJadwal } from "@/types";

const STATUS_TONE: Record<StatusJadwal, "success" | "warning" | "info" | "neutral"> = {
  "buka-penuh": "success",
  "buka-siang": "warning",
  khusus: "info",
  tutup: "neutral",
};

export function JadwalOperasionalCard() {
  const { draft, update, jadwalErrors } = usePengaturanForm();
  const { jedaTanam, setJedaTanam } = useDashboardData();
  const confirm = useConfirm();
  const toast = useToast();

  // Menutup katalog berdampak langsung ke warga, jadi MENGAKTIFKAN mode jeda
  // perlu konfirmasi. Membukanya kembali aman → langsung + toast. Mode ini
  // berlaku seketika (tidak menunggu "Simpan Pengaturan") dan memengaruhi
  // status lapak di ringkasan atas, pratinjau warga, dan banner Ringkasan.
  async function handleJedaTanam(next: boolean) {
    if (next) {
      const ok = await confirm({
        title: "Aktifkan mode jeda tanam?",
        description: "Katalog ditutup sementara dan warga tidak bisa memesan.",
        confirmLabel: "Ya, Tutup Sementara",
        tone: "danger",
      });
      if (!ok) return;
    }
    setJedaTanam(next);
    toast({
      type: next ? "info" : "success",
      title: next ? "Katalog ditutup sementara" : "Katalog dibuka kembali",
    });
  }

  function ubahBaris(index: number, patch: Partial<JadwalOperasional>) {
    update({ jadwal: draft.jadwal.map((row, i) => (i === index ? { ...row, ...patch } : row)) });
  }

  return (
    <Card className="p-5">
      <SectionHeader huruf="B" judul="Jadwal Buka Lapak & Operasional Lumbung" deskripsi="Atur jam operasional dan batas pesanan harian." icon={CalendarDays} />

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-surface-muted p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
          <Mountain className="h-4 w-4 shrink-0 text-ink-500" />
          <span>
            Mode Jeda Tanam / Cuaca Ekstrem
            <span className="hidden font-normal text-ink-500 sm:inline"> — Tutup katalog sementara tanpa menghapus data stok.</span>
          </span>
        </p>
        <Toggle aria-label="Mode jeda tanam" checked={jedaTanam} onChange={handleJedaTanam} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-ink-400">
              <th className="py-2 font-medium">Hari</th>
              <th className="py-2 font-medium">Status Lapak</th>
              <th className="py-2 font-medium">Buka Lumbung</th>
              <th className="py-2 font-medium">Batas Order Harian (Cut-off)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {draft.jadwal.map((row, i) => {
              const tutup = row.status === "tutup";
              const error = jadwalErrors[i];
              return (
                <tr key={row.hari} className="align-top">
                  <td className="py-3 pr-2 font-medium text-ink-900">{row.hari}</td>
                  <td className="py-3 pr-2">
                    <Select
                      compact
                      aria-label={`Status lapak ${row.hari}`}
                      value={row.status}
                      onChange={(e) => ubahBaris(i, { status: e.target.value as StatusJadwal })}
                      fullWidth={false}
                    >
                      {(Object.keys(STATUS_JADWAL_LABEL) as StatusJadwal[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_JADWAL_LABEL[s]}
                        </option>
                      ))}
                    </Select>
                    <div className="mt-1">
                      <Badge tone={STATUS_TONE[row.status]}>{STATUS_JADWAL_LABEL[row.status]}</Badge>
                    </div>
                  </td>
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-1.5">
                      <input type="time" aria-label={`Jam buka ${row.hari}`} value={row.buka} disabled={tutup} onChange={(e) => ubahBaris(i, { buka: e.target.value })} className={fieldClass({ compact: true, fullWidth: false })} />
                      <span className="text-ink-400">–</span>
                      <input type="time" aria-label={`Jam tutup ${row.hari}`} value={row.tutup} disabled={tutup} onChange={(e) => ubahBaris(i, { tutup: e.target.value })} className={fieldClass({ compact: true, fullWidth: false })} />
                    </div>
                    <p className="mt-1 text-xs text-ink-400">WIB</p>
                  </td>
                  <td className="py-3">
                    <input type="time" aria-label={`Batas order ${row.hari}`} value={row.cutOff} disabled={tutup} onChange={(e) => ubahBaris(i, { cutOff: e.target.value })} className={fieldClass({ compact: true, fullWidth: false })} />
                    <p className="mt-1 text-xs text-ink-400">{tutup ? "Tidak menerima pesanan" : row.catatan}</p>
                    {error && (
                      <p role="alert" className="mt-1 text-xs text-danger-600">
                        {error}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

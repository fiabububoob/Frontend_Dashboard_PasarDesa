"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { Select } from "@/components/ui/Select";
import { fieldClass } from "@/components/ui/formStyles";
import { STATUS_JADWAL_LABEL } from "@/lib/pengaturan";
import { usePengaturanForm } from "./PengaturanForm";
import { TutupSementaraPanel } from "./TutupSementaraPanel";
import type { JadwalOperasional, StatusJadwal } from "@/types";

export function JadwalOperasionalCard() {
  const { draft, update, jadwalErrors } = usePengaturanForm();

  function ubahBaris(index: number, patch: Partial<JadwalOperasional>) {
    update({ jadwal: draft.jadwal.map((row, i) => (i === index ? { ...row, ...patch } : row)) });
  }

  return (
    <section className="p-6">
      <SectionHeader judul="Jadwal buka" deskripsi="Semua jam dalam WIB. Pesanan setelah batas pesanan diproses hari berikutnya." />

      <TutupSementaraPanel />

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-500">
              <th className="py-2 font-semibold">Hari</th>
              <th className="py-2 font-semibold">Status</th>
              <th className="py-2 font-semibold">Jam buka</th>
              <th className="py-2 font-semibold">Batas pesanan</th>
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
                      aria-label={`Status ${row.hari}`}
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
                  </td>
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        aria-label={`Jam buka ${row.hari}`}
                        value={row.buka}
                        disabled={tutup}
                        onChange={(e) => ubahBaris(i, { buka: e.target.value })}
                        className={fieldClass({ compact: true, fullWidth: false })}
                      />
                      <span className="text-ink-400">–</span>
                      <input
                        type="time"
                        aria-label={`Jam tutup ${row.hari}`}
                        value={row.tutup}
                        disabled={tutup}
                        onChange={(e) => ubahBaris(i, { tutup: e.target.value })}
                        className={fieldClass({ compact: true, fullWidth: false })}
                      />
                    </div>
                  </td>
                  <td className="py-3">
                    <input
                      type="time"
                      aria-label={`Batas pesanan ${row.hari}`}
                      value={row.cutOff}
                      disabled={tutup}
                      onChange={(e) => ubahBaris(i, { cutOff: e.target.value })}
                      className={fieldClass({ compact: true, fullWidth: false })}
                    />
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
    </section>
  );
}

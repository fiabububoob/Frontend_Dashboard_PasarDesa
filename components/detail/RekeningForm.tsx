"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui/Field";
import { FormActions } from "@/components/ui/FormActions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { KAS_BANK } from "@/lib/data/kas";
import { useSimpanModal } from "./useSimpanModal";

export function RekeningForm() {
  const { rekening, ubahRekening } = useDashboardData();
  const { status, close, simpan } = useSimpanModal("Gagal menyimpan rekening");

  const [bank, setBank] = useState(rekening.bank);
  const [atasNama, setAtasNama] = useState(rekening.atasNama);
  const [nomor, setNomor] = useState(rekening.nomor);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    simpan(() => {
      ubahRekening({ bank, atasNama: atasNama.trim(), nomor: nomor.trim() });
      return { title: "Rekening diperbarui", description: "Menunggu verifikasi BUMDes (biasanya < 1 hari kerja)." };
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <p className="rounded-lg bg-surface-muted p-3 text-xs text-ink-500">
        Rekening harus atas nama pengurus Poktan. Setelah diubah, rekening perlu diverifikasi ulang oleh BUMDes.
      </p>

      <Field label="Bank" htmlFor="rek-bank">
        <Select id="rek-bank" value={bank} onChange={(e) => setBank(e.target.value)}>
          {KAS_BANK.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Atas nama" htmlFor="rek-nama">
        <Input id="rek-nama" required minLength={3} value={atasNama} onChange={(e) => setAtasNama(e.target.value)} />
      </Field>

      <Field label="Nomor rekening" htmlFor="rek-nomor">
        <Input
          id="rek-nomor"
          required
          inputMode="numeric"
          pattern="[0-9\-]{8,25}"
          patternMessage="Hanya angka dan tanda hubung, 8–25 karakter"
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
        />
      </Field>

      <FormActions onCancel={close} submitLabel="Simpan Rekening" status={status} />
    </form>
  );
}

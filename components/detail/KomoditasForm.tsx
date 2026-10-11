"use client";

import { useState, type FormEvent } from "react";
import { FormActions } from "@/components/ui/FormActions";
import { BagianDasar } from "@/components/komoditas/form/BagianDasar";
import { BagianDetail } from "@/components/komoditas/form/BagianDetail";
import { BagianHargaStok } from "@/components/komoditas/form/BagianHargaStok";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { adaError, dataDariDraft, draftDari, draftKosong, errorDraft, type DraftKomoditas } from "@/lib/komoditasForm";
import { useSimpanModal } from "./useSimpanModal";

function JudulBagian({ children }: { children: string }) {
  return <p className="border-t border-line pt-4 text-xs font-semibold uppercase text-ink-400">{children}</p>;
}

// Satu form untuk dua mode: tambah komoditas baru (tanpa id) dan ubah data komoditas yang sudah ada
// (dengan id). Isian disimpan sebagai satu `draft`; aturan konversi & validasi ada di lib/komoditasForm.ts.
export function KomoditasForm({ id }: { id?: string }) {
  const { komoditas, tambahKomoditas, ubahKomoditas } = useDashboardData();
  const { status, close, simpan } = useSimpanModal("Gagal menyimpan komoditas");

  const awal = id ? komoditas.find((k) => k.id === id) : undefined;
  const [draft, setDraft] = useState<DraftKomoditas>(() => (awal ? draftDari(awal) : draftKosong(new Date())));
  const update = (patch: Partial<DraftKomoditas>) => setDraft((d) => ({ ...d, ...patch }));
  const error = errorDraft(draft);

  if (id && !awal) return <p className="text-sm text-ink-500">Komoditas tidak ditemukan.</p>;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (adaError(error)) return;
    const data = dataDariDraft(draft);
    simpan(() => {
      if (awal) {
        ubahKomoditas(awal.id, data);
        return { title: "Komoditas diperbarui", description: data.nama };
      }
      tambahKomoditas(data);
      return { title: "Komoditas ditambahkan", description: `${data.nama} muncul di katalog warga.` };
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <BagianDasar draft={draft} update={update} />
      <JudulBagian>Harga & stok</JudulBagian>
      <BagianHargaStok draft={draft} update={update} error={error} />
      <JudulBagian>Detail untuk pembeli</JudulBagian>
      <BagianDetail draft={draft} update={update} />
      <FormActions onCancel={close} submitLabel={awal ? "Simpan Perubahan" : "Tambah Komoditas"} status={status} />
    </form>
  );
}
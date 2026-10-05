"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui/Field";
import { FormActions } from "@/components/ui/FormActions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { fieldClass } from "@/components/ui/formStyles";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useSimpanModal } from "./useSimpanModal";

export function TambahPanenForm({ initialId }: { initialId?: string }) {
  const { komoditas, tambahStok } = useDashboardData();
  const { status, close, simpan } = useSimpanModal("Gagal mencatat panen");

  const [id, setId] = useState(initialId ?? komoditas[0]?.id ?? "");
  const [jumlah, setJumlah] = useState("");
  const [catatan, setCatatan] = useState("");

  const terpilih = komoditas.find((k) => k.id === id);
  const sisaKapasitas = terpilih ? terpilih.stokMaks - terpilih.stok : 0;
  const nilai = Number(jumlah);
  const error = jumlah !== "" && nilai > sisaKapasitas ? `Melebihi kapasitas lumbung (sisa ${sisaKapasitas} ${terpilih?.satuan})` : undefined;
  const penuh = sisaKapasitas === 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!terpilih || error || penuh) return;
    simpan(() => {
      tambahStok(terpilih.id, nilai, catatan.trim() || undefined);
      const stokBaru = Math.min(terpilih.stok + nilai, terpilih.stokMaks);
      return { title: "Hasil panen tercatat", description: `${terpilih.nama}: stok ${terpilih.stok} → ${stokBaru} ${terpilih.satuan}.` };
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <Field label="Komoditas" htmlFor="panen-komoditas">
          <Select
            id="panen-komoditas"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setJumlah("");
            }}
          >
            {komoditas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.gambar} {k.nama}
              </option>
            ))}
          </Select>
        </Field>
        {terpilih && (
          <p className="mt-1.5 text-xs text-ink-500">
            Stok sekarang {terpilih.stok} dari {terpilih.stokMaks} {terpilih.satuan}
          </p>
        )}
      </div>

      <div>
        <Field label={`Jumlah panen masuk ${terpilih ? `(${terpilih.satuan})` : ""}`} htmlFor="panen-jumlah">
          <Input
            id="panen-jumlah"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="Contoh: 10"
            error={error}
            disabled={penuh}
          />
        </Field>
        {penuh && <p className="mt-1.5 text-xs text-warn-600">Lumbung untuk komoditas ini sudah penuh.</p>}
      </div>

      <Field label="Catatan (opsional)" htmlFor="panen-catatan">
        <textarea
          id="panen-catatan"
          rows={2}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Mis. panen blok timur, kondisi segar"
          className={fieldClass()}
        />
      </Field>

      <FormActions onCancel={close} submitLabel="Simpan Panen" status={status} submitDisabled={penuh} />
    </form>
  );
}

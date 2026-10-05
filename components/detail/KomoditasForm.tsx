"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/ui/Field";
import { FormActions } from "@/components/ui/FormActions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { IKON_KATEGORI, KATEGORI_KOMODITAS } from "@/lib/data/komoditas";
import { useSimpanModal } from "./useSimpanModal";

const IKON_BAWAAN = "🌱";

// Satu form untuk dua mode: tambah komoditas baru (tanpa id) dan ubah data
// komoditas yang sudah ada (dengan id).
export function KomoditasForm({ id }: { id?: string }) {
  const { komoditas, tambahKomoditas, ubahKomoditas } = useDashboardData();
  const { status, close, simpan } = useSimpanModal("Gagal menyimpan komoditas");

  const awal = id ? komoditas.find((k) => k.id === id) : undefined;

  const [nama, setNama] = useState(awal?.nama ?? "");
  const [kategori, setKategori] = useState<string>(awal?.kategori ?? KATEGORI_KOMODITAS[0]);
  const [gambar, setGambar] = useState(awal?.gambar ?? IKON_KATEGORI[KATEGORI_KOMODITAS[0]]);
  const [ikonDipilihSendiri, setIkonDipilihSendiri] = useState(Boolean(awal));
  const [asalBlok, setAsalBlok] = useState(awal?.asalBlok ?? "");
  const [harga, setHarga] = useState(awal ? String(awal.harga) : "");
  const [satuan, setSatuan] = useState(awal?.satuan ?? "kg");
  const [stok, setStok] = useState(awal ? String(awal.stok) : "");
  const [stokMaks, setStokMaks] = useState(awal ? String(awal.stokMaks) : "");
  const [tag, setTag] = useState(awal?.tag ?? "");
  const [hargaKeterangan, setHargaKeterangan] = useState(awal?.hargaKeterangan ?? "");

  if (id && !awal) return <p className="text-sm text-ink-500">Komoditas tidak ditemukan.</p>;

  const stokError = stok !== "" && stokMaks !== "" && Number(stok) > Number(stokMaks) ? "Stok tidak boleh melebihi kapasitas" : undefined;
  // Kategori lama di luar daftar baku tetap bisa dipilih agar data yang sudah ada tidak berubah diam-diam.
  const kategoriLama = awal && !(KATEGORI_KOMODITAS as readonly string[]).includes(awal.kategori) ? awal.kategori : undefined;

  function pilihKategori(nilai: string) {
    setKategori(nilai);
    // Ikon ikut kategori selama pengguna belum memilih ikon sendiri.
    if (!ikonDipilihSendiri) setGambar(IKON_KATEGORI[nilai] ?? IKON_BAWAAN);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (stokError) return;
    const data = {
      nama: nama.trim(),
      kategori,
      gambar: gambar.trim() || IKON_BAWAAN,
      asalBlok: asalBlok.trim(),
      harga: Number(harga),
      satuan: satuan.trim(),
      stok: Number(stok),
      stokMaks: Number(stokMaks),
      tag: tag.trim() || undefined,
      hargaKeterangan: hargaKeterangan.trim() || undefined,
    };
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
      <Field label="Nama komoditas" htmlFor="kmd-nama">
        <Input id="kmd-nama" required minLength={3} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Beras Merah Organik 5kg" />
      </Field>

      <div className="grid grid-cols-[1fr_5rem] gap-3">
        <Field label="Kategori" htmlFor="kmd-kategori">
          <Select id="kmd-kategori" value={kategori} onChange={(e) => pilihKategori(e.target.value)}>
            {KATEGORI_KOMODITAS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
            {kategoriLama && <option value={kategoriLama}>{kategoriLama}</option>}
          </Select>
        </Field>
        <Field label="Ikon" htmlFor="kmd-ikon">
          <Input
            id="kmd-ikon"
            maxLength={4}
            value={gambar}
            onChange={(e) => {
              setGambar(e.target.value);
              setIkonDipilihSendiri(true);
            }}
            className="text-center"
          />
        </Field>
      </div>

      <Field label="Asal blok / lumbung" htmlFor="kmd-asal">
        <Input id="kmd-asal" required value={asalBlok} onChange={(e) => setAsalBlok(e.target.value)} placeholder="Contoh: Blok Sawah Timur (RT 04)" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga" htmlFor="kmd-harga">
          <Input id="kmd-harga" type="number" inputMode="numeric" min={100} step={100} required prefixText="Rp" value={harga} onChange={(e) => setHarga(e.target.value)} />
        </Field>
        <Field label="Satuan" htmlFor="kmd-satuan">
          <Input id="kmd-satuan" required value={satuan} onChange={(e) => setSatuan(e.target.value)} placeholder="kg, sak, ikat…" />
        </Field>
        <Field label="Stok sekarang" htmlFor="kmd-stok">
          <Input id="kmd-stok" type="number" inputMode="numeric" min={0} step={1} required value={stok} onChange={(e) => setStok(e.target.value)} error={stokError} />
        </Field>
        <Field label="Kapasitas maks." htmlFor="kmd-maks">
          <Input id="kmd-maks" type="number" inputMode="numeric" min={1} step={1} required value={stokMaks} onChange={(e) => setStokMaks(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Label (opsional)" htmlFor="kmd-tag">
          <Input id="kmd-tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Mis. Organik" />
        </Field>
        <Field label="Keterangan harga (opsional)" htmlFor="kmd-ket">
          <Input id="kmd-ket" value={hargaKeterangan} onChange={(e) => setHargaKeterangan(e.target.value)} placeholder="Mis. Harga acuan pasar" />
        </Field>
      </div>

      <FormActions onCancel={close} submitLabel={awal ? "Simpan Perubahan" : "Tambah Komoditas"} status={status} />
    </form>
  );
}

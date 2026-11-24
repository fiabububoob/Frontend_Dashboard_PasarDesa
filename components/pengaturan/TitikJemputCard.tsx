"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { usePengaturanForm } from "./PengaturanForm";

// Satu titik penjemputan tetap. Nama & alamat dipakai kurir; petunjuk akses
// juga hanya untuk kurir (tidak tampil di aplikasi warga).
export function TitikJemputCard() {
  const { draft, update } = usePengaturanForm();
  const lokasi = draft.titikJemput;

  return (
    <section className="p-6">
      <SectionHeader judul="Titik penjemputan" deskripsi="Satu tempat tetap, tempat kurir desa mengambil panen yang sudah dikemas." />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lokasiNama" className="text-sm font-medium text-ink-900">
            Nama lokasi
          </label>
          <Input
            id="lokasiNama"
            required
            minLength={3}
            value={lokasi.nama}
            onChange={(e) => update({ titikJemput: { ...lokasi, nama: e.target.value } })}
            containerClassName="mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="lokasiAlamat" className="text-sm font-medium text-ink-900">
            Alamat
          </label>
          <Input
            id="lokasiAlamat"
            required
            minLength={5}
            value={lokasi.alamat}
            onChange={(e) => update({ titikJemput: { ...lokasi, alamat: e.target.value } })}
            containerClassName="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="petunjuk" className="text-sm font-medium text-ink-900">
            Petunjuk akses untuk kurir
          </label>
          <Input id="petunjuk" value={draft.petunjukAkses} onChange={(e) => update({ petunjukAkses: e.target.value })} containerClassName="mt-1.5" />
          <p className="mt-1 text-xs text-ink-400">Hanya terlihat oleh kurir, tidak tampil ke warga.</p>
        </div>
      </div>
    </section>
  );
}

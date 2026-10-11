import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FotoUploader } from "@/components/komoditas/FotoUploader";
import { KATEGORI_INDUK } from "@/lib/data/kategori";
import { IKON_BAWAAN, IKON_SUB_KATEGORI, NAMA_SUB_KATEGORI } from "@/lib/kategori";
import type { DraftKomoditas, UpdateDraft } from "@/lib/komoditasForm";

interface BagianDasarProps {
  draft: DraftKomoditas;
  update: UpdateDraft;
}

// Bagian 1 form komoditas: foto, nama, kategori, ikon cadangan, asal blok.
export function BagianDasar({ draft, update }: BagianDasarProps) {
  // Kategori lama di luar pohon kategori tetap bisa dipilih agar data yang sudah ada tidak berubah diam-diam.
  const kategoriLama = NAMA_SUB_KATEGORI.includes(draft.kategori) ? undefined : draft.kategori;

  function pilihKategori(kategori: string) {
    // Ikon cadangan ikut kategori selama pengguna belum memilih ikon sendiri.
    update(draft.ikonDipilihSendiri ? { kategori } : { kategori, gambar: IKON_SUB_KATEGORI[kategori] ?? IKON_BAWAAN });
  }

  return (
    <>
      <FotoUploader foto={draft.foto} onChange={(foto) => update({ foto })} />

      <Field label="Nama komoditas" htmlFor="kmd-nama">
        <Input id="kmd-nama" required minLength={3} value={draft.nama} onChange={(e) => update({ nama: e.target.value })} placeholder="Contoh: Beras Merah Organik 5kg" />
      </Field>

      <div className="grid grid-cols-[1fr_5rem] gap-3">
        <Field label="Kategori" htmlFor="kmd-kategori">
          <Select id="kmd-kategori" value={draft.kategori} onChange={(e) => pilihKategori(e.target.value)}>
            {KATEGORI_INDUK.map((induk) => (
              <optgroup key={induk.id} label={induk.nama}>
                {induk.anak.map((sub) => (
                  <option key={sub.id} value={sub.nama}>
                    {sub.nama}
                  </option>
                ))}
              </optgroup>
            ))}
            {kategoriLama && <option value={kategoriLama}>{kategoriLama}</option>}
          </Select>
        </Field>
        <Field label="Ikon cadangan" htmlFor="kmd-ikon">
          <Input id="kmd-ikon" maxLength={4} value={draft.gambar} onChange={(e) => update({ gambar: e.target.value, ikonDipilihSendiri: true })} className="text-center" />
        </Field>
      </div>

      <Field label="Asal blok / lumbung" htmlFor="kmd-asal">
        <Input id="kmd-asal" required value={draft.asalBlok} onChange={(e) => update({ asalBlok: e.target.value })} placeholder="Contoh: Blok Sawah Timur (RT 04)" />
      </Field>
    </>
  );
}
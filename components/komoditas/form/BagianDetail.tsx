import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { fieldClass } from "@/components/ui/formStyles";
import { BadgePicker } from "@/components/komoditas/BadgePicker";
import { SpesifikasiEditor } from "@/components/komoditas/SpesifikasiEditor";
import { MAKS_DESKRIPSI, MAKS_SARAN_PENYIMPANAN } from "@/lib/constants";
import type { DraftKomoditas, UpdateDraft } from "@/lib/komoditasForm";

interface BagianDetailProps {
  draft: DraftKomoditas;
  update: UpdateDraft;
}

// Bagian 3 form komoditas: informasi yang tampil di halaman detail produk app pembeli.
export function BagianDetail({ draft, update }: BagianDetailProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tanggal panen" htmlFor="kmd-panen">
          <Input id="kmd-panen" type="date" value={draft.tanggalPanen} onChange={(e) => update({ tanggalPanen: e.target.value })} />
        </Field>
        <Field label="Label teks (opsional)" htmlFor="kmd-tag">
          <Input id="kmd-tag" value={draft.tag} onChange={(e) => update({ tag: e.target.value })} placeholder="Mis. Organik, Halal" />
        </Field>
      </div>

      <BadgePicker nilai={draft.badge} onChange={(badge) => update({ badge })} />

      <Field label="Deskripsi lengkap" htmlFor="kmd-deskripsi">
        <textarea
          id="kmd-deskripsi"
          rows={4}
          maxLength={MAKS_DESKRIPSI}
          value={draft.deskripsi}
          onChange={(e) => update({ deskripsi: e.target.value })}
          placeholder="Ceritakan asal, kualitas, dan keunggulan produk."
          className={fieldClass()}
        />
        <p className="mt-1 text-xs text-ink-400">
          {draft.deskripsi.length} / {MAKS_DESKRIPSI} karakter
        </p>
      </Field>

      <SpesifikasiEditor nilai={draft.spesifikasi} onChange={(spesifikasi) => update({ spesifikasi })} />

      <Field label="Saran penyimpanan (opsional)" htmlFor="kmd-saran">
        <Input
          id="kmd-saran"
          maxLength={MAKS_SARAN_PENYIMPANAN}
          value={draft.saranPenyimpanan}
          onChange={(e) => update({ saranPenyimpanan: e.target.value })}
          placeholder="Mis. Simpan di wadah tertutup, jauhkan dari sinar matahari"
        />
      </Field>
    </>
  );
}
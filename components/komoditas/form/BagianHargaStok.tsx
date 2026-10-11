import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { DraftKomoditas, ErrorDraft, UpdateDraft } from "@/lib/komoditasForm";

interface BagianHargaStokProps {
  draft: DraftKomoditas;
  update: UpdateDraft;
  error: ErrorDraft;
}

// Bagian 2 form komoditas: harga, harga coret, satuan, ukuran, stok.
export function BagianHargaStok({ draft, update, error }: BagianHargaStokProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Harga jual" htmlFor="kmd-harga">
        <Input id="kmd-harga" type="number" inputMode="numeric" min={100} step={100} required prefixText="Rp" value={draft.harga} onChange={(e) => update({ harga: e.target.value })} />
      </Field>
      <Field label="Harga coret (opsional)" htmlFor="kmd-coret">
        <Input
          id="kmd-coret"
          type="number"
          inputMode="numeric"
          min={100}
          step={100}
          prefixText="Rp"
          value={draft.hargaCoret}
          onChange={(e) => update({ hargaCoret: e.target.value })}
          error={error.hargaCoret}
        />
      </Field>
      <Field label="Satuan" htmlFor="kmd-satuan">
        <Input id="kmd-satuan" required value={draft.satuan} onChange={(e) => update({ satuan: e.target.value })} placeholder="kg, sak, ikat…" />
      </Field>
      <Field label="Ukuran / takaran (opsional)" htmlFor="kmd-ukuran">
        <Input id="kmd-ukuran" value={draft.ukuran} onChange={(e) => update({ ukuran: e.target.value })} placeholder="Mis. 5 kg, 250 ml" />
      </Field>
      <Field label="Stok sekarang" htmlFor="kmd-stok">
        <Input id="kmd-stok" type="number" inputMode="numeric" min={0} step={1} required value={draft.stok} onChange={(e) => update({ stok: e.target.value })} error={error.stok} />
      </Field>
      <Field label="Kapasitas maks." htmlFor="kmd-maks">
        <Input id="kmd-maks" type="number" inputMode="numeric" min={1} step={1} required value={draft.stokMaks} onChange={(e) => update({ stokMaks: e.target.value })} />
      </Field>
      <div className="col-span-2">
        <Field label="Keterangan harga (opsional)" htmlFor="kmd-ket">
          <Input id="kmd-ket" value={draft.hargaKeterangan} onChange={(e) => update({ hargaKeterangan: e.target.value })} placeholder="Mis. Harga acuan pasar" />
        </Field>
      </div>
    </div>
  );
}
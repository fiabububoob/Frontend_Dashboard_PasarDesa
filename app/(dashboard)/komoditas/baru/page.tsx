import { FormKomoditas } from "./FormKomoditas";
export const metadata = { title: "Tambah Komoditas — PasarDesa" };
export default function TambahKomoditasPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="font-display text-xl font-bold text-ink-900">Tambah Komoditas</h1>
      <FormKomoditas />
    </div>
  );
}
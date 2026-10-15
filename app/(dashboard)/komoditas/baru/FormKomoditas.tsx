"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { aksiTambahKomoditas } from "./actions";

function Tombol() {
  const { pending } = useFormStatus(); // status tombol saat submit
  return <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{pending ? "Menyimpan…" : "Simpan"}</button>;
}

function Field({ label, name, type = "text", required = false, placeholder = "" }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-700">{label}{required && " *"}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
    </label>
  );
}

export function FormKomoditas() {
  const [state, action] = useActionState(aksiTambahKomoditas, { error: null as string | null });
  return (
    <form action={action} className="space-y-4">
      {state.error && <p className="rounded-lg bg-danger-50 p-3 text-sm text-danger-600">{state.error}</p>}
      <Field label="Nama" name="nama" required />
      <Field label="Kategori" name="kategori" placeholder="Beras & Gabah" />
      <Field label="Emoji" name="gambar" placeholder="🌾" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Harga" name="harga" type="number" required />
        <Field label="Satuan" name="satuan" placeholder="kg" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Stok" name="stok" type="number" />
        <Field label="Stok maks" name="stokMaks" type="number" />
      </div>
      <Tombol />
    </form>
  );
}
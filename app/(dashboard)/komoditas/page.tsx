import Link from "next/link";
import { getDaftarKomoditas } from "@/lib/server/komoditas";
import { formatRupiah } from "@/lib/format";

export const metadata = { title: "Komoditas — PasarDesa" };
export const revalidate = 60; // strategi render: ISR

export default async function KomoditasPage() {
  const komoditas = await getDaftarKomoditas();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900">Komoditas</h1>
        <Link href="/komoditas/baru" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">+ Tambah</Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs text-ink-500">
            <tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Harga</th><th className="px-4 py-3">Stok</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {komoditas.map((k) => (
              <tr key={k.id} className="hover:bg-surface-muted">
                <td className="px-4 py-3 font-medium text-ink-900">{k.gambar} {k.nama}</td>
                <td className="px-4 py-3 text-ink-500">{k.kategori}</td>
                <td className="px-4 py-3">{formatRupiah(k.harga)}</td>
                <td className="px-4 py-3">{k.stok} {k.satuan}</td>
                <td className="px-4 py-3 text-right"><Link href={`/komoditas/${k.id}`} className="font-medium text-brand-700 hover:underline">Detail</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { notFound } from "next/navigation";
import Link from "next/link";
import { getKomoditas } from "@/lib/server/komoditas";
import { formatRupiah } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Next 15: params di-await
  const k = await getKomoditas(id);
  return { title: k ? `${k.nama} — PasarDesa` : "Tidak ditemukan" };
}

export default async function DetailKomoditas({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const k = await getKomoditas(id);
  if (!k) notFound();

  return (
    <div className="space-y-4">
      <Link href="/komoditas" className="text-sm text-brand-700 hover:underline">← Kembali</Link>
      <div className="rounded-lg border border-line p-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{k.gambar}</span>
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900">{k.nama}</h1>
            <p className="text-sm text-ink-500">{k.kategori} · {k.asalBlok}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-ink-500">Harga</dt><dd className="font-medium">{formatRupiah(k.harga)} / {k.satuan}</dd></div>
          <div><dt className="text-ink-500">Stok</dt><dd className="font-medium">{k.stok} {k.satuan}</dd></div>
          <div><dt className="text-ink-500">Status</dt><dd className="font-medium">{k.statusStok}</dd></div>
          <div><dt className="text-ink-500">SKU</dt><dd className="font-medium">{k.sku}</dd></div>
        </dl>
        {k.deskripsi && <p className="mt-4 text-sm text-ink-700">{k.deskripsi}</p>}
      </div>
    </div>
  );
}
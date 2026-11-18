import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-5xl font-bold text-ink-900">404</p>
      <p className="text-ink-500">Halaman atau data tidak ditemukan.</p>
      <Link href="/" className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">Kembali</Link>
    </div>
  );
}
"use client";

import Link from "next/link";
import { ExternalLink, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { formatRupiah } from "@/lib/format";
import { hitungKritis } from "@/lib/stok";
import { useDetail } from "./DetailProvider";

const TONE = { aman: "success", menengah: "warning", kritis: "danger" } as const;

export function KategoriContent({ nama }: { nama: string }) {
  const { komoditas } = useDashboardData();
  const { push } = useDetail();
  const items = komoditas.filter((k) => k.kategori === nama);

  if (items.length === 0) {
    return <EmptyState icon={Inbox} title="Belum ada komoditas" description="Belum ada hasil tani di kategori ini." />;
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-ink-500">
        {items.length} komoditas · {hitungKritis(items)} stok kritis
      </p>
      <ul className="space-y-2">
        {items.map((k) => (
          <li key={k.id}>
            <button
              type="button"
              onClick={() => push({ type: "komoditas", id: k.id })}
              className="flex w-full items-center gap-3 rounded-lg border border-line p-3 text-left transition-colors duration-feedback ease-enter hover:bg-surface-muted"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-lg">{k.gambar}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink-900">{k.nama}</span>
                <span className="block text-xs text-ink-500">
                  {formatRupiah(k.harga)} / {k.satuan} · {k.asalBlok}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xs font-medium text-ink-900">
                  {k.stok} {k.satuan}
                </span>
                <Badge tone={TONE[k.statusStok]}>{k.statusStok === "aman" ? "Aman" : k.statusStok === "menengah" ? "Menengah" : "Kritis"}</Badge>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-end pt-1">
        <Link
          href="/komoditas"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
        >
          <ExternalLink className="h-4 w-4" />
          Buka halaman Komoditas
        </Link>
      </div>
    </div>
  );
}

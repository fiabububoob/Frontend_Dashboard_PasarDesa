import { Skeleton } from "@/components/ui/Skeleton";

// Ditampilkan otomatis oleh Next.js saat halaman sedang memuat data (state "loading").
export default function Loading() {
  return (
    <div role="status" aria-label="Memuat halaman" className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

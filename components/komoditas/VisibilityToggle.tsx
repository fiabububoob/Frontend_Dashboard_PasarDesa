"use client";

import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";

// Toggle "tampil di katalog warga" untuk satu baris komoditas. Sekarang
// controlled dari data hidup, jadi statusnya ikut berubah di Ringkasan, modal
// detail, dan statistik. Aksinya mudah dibalik → cukup toast, tanpa konfirmasi.
export function VisibilityToggle({ id, nama, checked }: { id: string; nama: string; checked: boolean }) {
  const toast = useToast();
  const { setTampil } = useDashboardData();
  return (
    <Toggle
      aria-label={`Tampilkan ${nama} di katalog warga`}
      checked={checked}
      onChange={async (next) => {
        try {
          await setTampil(id, next);
          toast({
            type: "success",
            title: next ? "Ditampilkan di katalog warga" : "Disembunyikan dari katalog warga",
            description: nama,
          });
        } catch (e) {
          toast({ type: "error", title: "Gagal mengubah status", description: e instanceof Error ? e.message : undefined });
        }
      }}
    />
  );
}

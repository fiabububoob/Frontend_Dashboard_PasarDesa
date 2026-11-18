"use client";

import { Eye, EyeOff, MoreVertical, PackagePlus, ScanSearch } from "lucide-react";
import { Popover } from "@/components/layout/topbar/Popover";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { BARIS_AKSI } from "./tampilan";
import type { Komoditas } from "@/types";

const ITEM = "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink-700 transition-colors duration-feedback ease-enter hover:bg-surface-muted";

// Menu titik tiga di tiap baris/kartu: detail, catat panen, aktifkan/nonaktifkan.
export function MenuAksiKomoditas({ k }: { k: Komoditas }) {
  const { open } = useDetail();
  const toast = useToast();
  const { setTampil } = useDashboardData();

  return (
    <Popover
      lebar="w-52"
      pemicu={({ buka, toggle }) => (
        <button type="button" aria-haspopup="menu" aria-expanded={buka} aria-label={`Aksi lain untuk ${k.nama}`} onClick={toggle} className={BARIS_AKSI}>
          <MoreVertical className="h-4 w-4" />
        </button>
      )}
    >
      {(tutup) => (
        <div role="menu">
          <button type="button" role="menuitem" className={ITEM} onClick={() => { open({ type: "komoditas", id: k.id }); tutup(); }}>
            <ScanSearch className="h-4 w-4 text-ink-400" aria-hidden /> Lihat detail
          </button>
          <button type="button" role="menuitem" className={ITEM} onClick={() => { open({ type: "tambah-panen", komoditasId: k.id }); tutup(); }}>
            <PackagePlus className="h-4 w-4 text-ink-400" aria-hidden /> Catat panen
          </button>
          <button
            type="button"
            role="menuitem"
            className={ITEM}
            onClick={() => {
              setTampil(k.id, !k.tampil);
              toast({ type: "success", title: k.tampil ? "Disembunyikan dari katalog warga" : "Ditampilkan di katalog warga", description: k.nama });
              tutup();
            }}
          >
            {k.tampil ? <EyeOff className="h-4 w-4 text-ink-400" aria-hidden /> : <Eye className="h-4 w-4 text-ink-400" aria-hidden />}
            {k.tampil ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>
      )}
    </Popover>
  );
}

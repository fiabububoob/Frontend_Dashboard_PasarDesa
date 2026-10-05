"use client";

import { MapPin, Phone, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { KURIR_DEFAULT } from "@/lib/data/pesanan";
import type { Pesanan } from "@/types";

export function KartuKurir({ pesanan }: { pesanan: Pesanan }) {
  const { tugaskanKurir } = useDashboardData();
  const { open } = useDetail();
  const toast = useToast();
  const { kurir } = pesanan;

  function tugaskan() {
    tugaskanKurir(pesanan.id);
    toast({ type: "success", title: "Kurir ditugaskan", description: `#${pesanan.id} akan dijemput ${KURIR_DEFAULT.nama}.` });
  }

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-xs font-medium uppercase text-ink-400">Penugasan Kurir Desa</p>
      {kurir ? (
        <>
          <p className="mt-2 text-sm font-medium text-ink-900">{kurir.nama}</p>
          <p className="text-xs text-ink-500">{kurir.armada}</p>
          <p className="mt-1 text-xs text-ink-500">Jadwal jemput sore: {kurir.jadwal}</p>
          <div className="mt-3 flex gap-2">
            {kurir.telepon ? (
              <LinkButton href={`tel:${kurir.telepon}`} size="sm" className="flex-1">
                <Phone className="h-3.5 w-3.5" />
                Kontak
              </LinkButton>
            ) : (
              <Button variant="secondary" size="sm" disabled className="flex-1">
                <Phone className="h-3.5 w-3.5" />
                Kontak
              </Button>
            )}
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => open({ type: "kurir" })}>
              <MapPin className="h-3.5 w-3.5" />
              Posisi
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-400">Belum ditugaskan</p>
          <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={tugaskan}>
            <UserPlus className="h-3.5 w-3.5" />
            Tugaskan Kurir
          </Button>
        </>
      )}
    </div>
  );
}

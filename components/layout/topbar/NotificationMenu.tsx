"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { AlertTriangle, Bell, Bike, Megaphone, Package, type LucideIcon } from "lucide-react";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import { buatNotifikasi, type JenisNotifikasi } from "@/lib/notifikasi";
import { Popover } from "./Popover";

const TAMPILAN: Record<JenisNotifikasi, { icon: LucideIcon; warna: string }> = {
  dikemas: { icon: Package, warna: "text-warn-600" },
  "stok-kritis": { icon: AlertTriangle, warna: "text-danger-600" },
  kurir: { icon: Bike, warna: "text-brand-600" },
  pengumuman: { icon: Megaphone, warna: "text-brand-600" },
};

export function NotificationMenu() {
  const { komoditas, pesanan } = useDashboardData();
  const { open } = useDetail();
  const [sudahDibaca, setSudahDibaca] = useState(false);
  const notifikasi = useMemo(() => buatNotifikasi({ pesanan, komoditas }), [pesanan, komoditas]);

  return (
    <Popover
      lebar="w-80"
      onBuka={() => setSudahDibaca(true)}
      pemicu={({ buka, toggle }) => (
        <button
          type="button"
          aria-label="Notifikasi"
          aria-expanded={buka}
          onClick={toggle}
          className="relative rounded-lg border border-line p-2.5 text-ink-500 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
        >
          <Bell className="h-[18px] w-[18px]" />
          {!sudahDibaca && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger-600" />}
        </button>
      )}
    >
      {(tutup) => (
        <>
          <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase text-ink-400">Notifikasi</p>
          {notifikasi.map((n) => {
            const { icon: Icon, warna } = TAMPILAN[n.jenis];
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => {
                  open(n.target);
                  tutup();
                }}
                className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-feedback ease-enter hover:bg-surface-muted"
              >
                <Icon className={clsx("mt-0.5 h-4 w-4 shrink-0", warna)} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink-900">{n.judul}</span>
                  <span className="block text-xs text-ink-500">{n.keterangan}</span>
                </span>
              </button>
            );
          })}
        </>
      )}
    </Popover>
  );
}

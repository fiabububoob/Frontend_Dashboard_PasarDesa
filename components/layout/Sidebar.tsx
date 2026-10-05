"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Sprout, Headset, Megaphone } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-items";
import { WARTA_LIST } from "@/lib/data/ringkasan";
import { useDetail } from "@/components/detail/DetailProvider";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useStatusLapak } from "@/components/providers/useStatusLapak";
import { hitungStatus } from "@/lib/pesanan";

const ITEM_BASE = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-feedback ease-enter";
const ITEM_IDLE = "font-medium text-ink-500 hover:bg-surface-muted hover:text-ink-900";
const ITEM_ACTIVE = "bg-brand-50 font-semibold text-brand-700";

function GroupLabel({ children }: { children: string }) {
  return <p className="px-3 pb-2 text-xs font-medium text-ink-400">{children}</p>;
}

// Sidebar reads NAV_ITEMS from lib/nav-items.ts — it has zero knowledge of
// what pages exist beyond that list, so it never needs to change when pages
// are added or renamed.
export function Sidebar() {
  const pathname = usePathname();
  const { open } = useDetail();
  const { pesanan, pengaturan } = useDashboardData();
  const perluDikemas = hitungStatus(pesanan, "perlu-dikemas");

  const { status: lapak } = useStatusLapak(pengaturan);

  const buka = lapak?.buka ?? true;
  const judulStatus = !lapak ? "Memeriksa status…" : lapak.buka ? "Lapak Buka" : lapak.kode === "jeda" ? "Ditutup Sementara" : "Lapak Tutup";
  const keterangan = !lapak ? "" : lapak.buka ? `Menerima pesanan · ${lapak.keterangan}` : lapak.keterangan;

  return (
    <aside className="hidden w-64 shrink-0 flex-col px-4 pb-5 pt-6 lg:flex">
      <div className="flex items-center gap-2.5 px-3 pb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Sprout className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-base font-semibold leading-tight text-ink-900">PasarDesa</p>
          <p className="text-xs leading-tight text-ink-500">Portal Sukorejo</p>
        </div>
      </div>

      <nav aria-label="Menu" className="flex-1 overflow-y-auto">
        <GroupLabel>Menu</GroupLabel>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            // Badge pesanan dihitung dari data hidup, bukan teks tetap.
            const badge = item.href === "/pesanan" && perluDikemas > 0 ? perluDikemas : undefined;
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={active ? "page" : undefined} className={clsx(ITEM_BASE, "justify-between", active ? ITEM_ACTIVE : ITEM_IDLE)}>
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon className={clsx("h-[18px] w-[18px] shrink-0", active ? "text-brand-600" : "text-ink-400")} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {badge !== undefined && (
                    <span aria-label={`${badge} pesanan baru`} className="shrink-0 rounded-full bg-warn-50 px-2 py-0.5 text-[11px] font-semibold text-warn-600">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <GroupLabel>Bantuan</GroupLabel>
          <ul className="space-y-1">
            <li>
              <button type="button" onClick={() => open({ type: "hotline" })} className={clsx(ITEM_BASE, ITEM_IDLE)}>
                <Headset className="h-[18px] w-[18px] shrink-0 text-ink-400" />
                Hubungi CS
              </button>
            </li>
            <li>
              <button type="button" onClick={() => open({ type: "warta", id: WARTA_LIST[0].id })} className={clsx(ITEM_BASE, ITEM_IDLE)}>
                <Megaphone className="h-[18px] w-[18px] shrink-0 text-ink-400" />
                Pengumuman
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Status toko: satu-satunya info di dasar sidebar, bergaya outline seperti tombol Logout pada referensi */}
      <div className={clsx("rounded-lg border px-3 py-2.5", buka ? "border-line" : "border-warn-400/50 bg-warn-50")} aria-live="polite">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
          <span className={clsx("h-2 w-2 rounded-full", buka ? "bg-brand-500" : "bg-warn-400")} />
          {judulStatus}
        </p>
        {keterangan && <p className="mt-0.5 pl-4 text-xs text-ink-500">{keterangan}</p>}
      </div>
    </aside>
  );
}

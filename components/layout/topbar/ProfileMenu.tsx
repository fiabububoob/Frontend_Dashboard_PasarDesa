"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ChevronDown, Headset, Store, UserRound, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useDetail } from "@/components/detail/DetailProvider";
import type { DetailTarget } from "@/types";
import { Popover } from "./Popover";

const ITEM_CLASS =
  "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-ink-700 transition-colors duration-feedback ease-enter hover:bg-surface-muted";

const AKSI_MODAL: { icon: LucideIcon; label: string; target: DetailTarget }[] = [
  { icon: UserRound, label: "Edit Profil", target: { type: "profil" } },
  { icon: Headset, label: "Hubungi CS", target: { type: "hotline" } },
];

export function ProfileMenu() {
  const { profil, pengaturan } = useDashboardData();
  const { open } = useDetail();

  return (
    <Popover
      lebar="w-64"
      pemicu={({ buka, toggle }) => (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={buka}
          aria-label="Menu profil"
          onClick={toggle}
          className="flex items-center gap-2 rounded-lg p-1 transition-colors duration-feedback ease-enter hover:bg-surface-muted"
        >
          <Avatar foto={profil.foto} nama={profil.nama} className="h-9 w-9 text-sm" />
          <span className="hidden text-left text-xs sm:block">
            <span className="block font-medium text-ink-900">{profil.nama}</span>
            <span className="block text-ink-500">Mitra Resmi BUMDes</span>
          </span>
          <ChevronDown className={clsx("hidden h-3.5 w-3.5 text-ink-400 transition-transform duration-feedback ease-enter sm:block", buka && "rotate-180")} aria-hidden />
        </button>
      )}
    >
      {(tutup) => (
        <div role="menu">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar foto={profil.foto} nama={profil.nama} className="h-11 w-11 text-base" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{profil.nama}</p>
              <p className="truncate text-xs text-ink-500">{profil.jabatan}</p>
              <p className="truncate text-xs text-ink-400">{pengaturan.namaLapak}</p>
            </div>
          </div>
          <div className="my-1 border-t border-line" />
          {AKSI_MODAL.map(({ icon: Icon, label, target }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => {
                open(target);
                tutup();
              }}
              className={ITEM_CLASS}
            >
              <Icon className="h-4 w-4 text-ink-400" aria-hidden />
              {label}
            </button>
          ))}
          <Link href="/pengaturan" role="menuitem" onClick={tutup} className={ITEM_CLASS}>
            <Store className="h-4 w-4 text-ink-400" aria-hidden />
            Pengaturan
          </Link>
        </div>
      )}
    </Popover>
  );
}

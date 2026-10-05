"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { StatusBadge } from "@/components/pesanan/StatusBadge";
import { perluDijemput } from "@/lib/pesanan";
import { KURIR_AKTIF } from "@/lib/data/ringkasan";
import { LinkButton } from "@/components/ui/LinkButton";
import { waLink } from "@/lib/format";
import { useDetail } from "./DetailProvider";

export function KurirContent() {
  const { pesanan } = useDashboardData();
  const { push } = useDetail();
  const k = KURIR_AKTIF;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{k.inisial}</div>
        <div>
          <p className="font-medium text-ink-900">{k.nama}</p>
          <p className="text-xs text-ink-500">{k.armada}</p>
        </div>
      </div>

      <dl className="space-y-2 text-xs">
        <div>
          <dt className="text-ink-500">Rute Pengantaran</dt>
          <dd className="font-medium text-ink-900">{k.rute}</dd>
        </div>
        <div>
          <dt className="text-ink-500">Estimasi Tiba di Lumbung</dt>
          <dd className="font-medium text-warn-600">{k.estimasi}</dd>
        </div>
      </dl>

      <div>
        <p className="text-xs font-medium uppercase text-ink-400">Paket yang akan dijemput</p>
        <ul className="mt-2 space-y-1.5">
          {pesanan.filter(perluDijemput).map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => push({ type: "pesanan", id: p.id })}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-left transition-colors duration-feedback ease-enter hover:bg-surface-muted"
              >
                <span>
                  <span className="block font-medium text-ink-900">#{p.id}</span>
                  <span className="block text-xs text-ink-500">{p.dropPoint}</span>
                </span>
                <StatusBadge status={p.status} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 pt-1">
        <LinkButton href={`tel:${k.telepon}`} className="flex-1">
          <Phone className="h-4 w-4" />
          Telepon
        </LinkButton>
        <LinkButton href={waLink(k.telepon)} external className="flex-1">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </LinkButton>
      </div>
    </div>
  );
}

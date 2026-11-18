import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { STATUS_LABEL } from "@/lib/pesanan";
import type { StatusPesanan } from "@/types";

// Centralizes the label + color mapping for order status. Both the
// Ringkasan "Antrean Pesanan Mendesak" table and the full Pesanan page use
// this, so a new status only needs to be added here once.
const TONE: Record<StatusPesanan, BadgeTone> = {
  "menunggu-pembayaran": "warning",
  "perlu-dikemas": "warning",
  "siap-jemput": "info",
  diantar: "info",
  "tiba-di-pos": "info",
  komplain: "danger",
  selesai: "neutral",
  dibatalkan: "danger",
};

export function StatusBadge({ status }: { status: StatusPesanan }) {
  return <Badge tone={TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
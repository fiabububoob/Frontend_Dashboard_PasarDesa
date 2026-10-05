import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { STATUS_LABEL } from "@/lib/pesanan";
import type { StatusKemas } from "@/types";

// Centralizes the label + color mapping for order status. Both the
// Ringkasan "Antrean Pesanan Mendesak" table and the full Pesanan page use
// this, so a new status only needs to be added here once.
const TONE: Record<StatusKemas, BadgeTone> = {
  "perlu-dikemas": "warning",
  "sedang-dikemas": "info",
  "siap-jemput": "success",
  selesai: "neutral",
};

export function StatusBadge({ status }: { status: StatusKemas }) {
  return <Badge tone={TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

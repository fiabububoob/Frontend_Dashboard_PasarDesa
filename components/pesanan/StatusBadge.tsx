import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { labelStatus } from "@/lib/pesanan";
import type { Pesanan, StatusPesanan } from "@/types";

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

// Terima seluruh pesanan (bukan hanya status) agar labelnya sesuai opsi pengiriman: "Siap Diambil di Pos" vs "Tiba di Pos".
export function StatusBadge({ pesanan }: { pesanan: Pick<Pesanan, "status" | "opsiPengiriman"> }) {
  return <Badge tone={TONE[pesanan.status]}>{labelStatus(pesanan)}</Badge>;
}
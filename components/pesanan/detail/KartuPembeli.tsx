import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { waLink } from "@/lib/format";
import type { Pesanan } from "@/types";

export function KartuPembeli({ pesanan }: { pesanan: Pesanan }) {
  const pesanWa = `Halo ${pesanan.pembeli}, pesanan #${pesanan.id} dari BUMDes Sukorejo sedang kami proses. Drop-point: ${pesanan.dropPoint}.`;

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-xs font-medium uppercase text-ink-400">Informasi Pembeli</p>
      <p className="mt-2 text-sm font-medium text-ink-900">{pesanan.pembeli}</p>
      <p className="text-xs text-ink-500">{pesanan.alamat}</p>
      <p className="mt-1 text-xs text-ink-500">Drop-point: {pesanan.dropPoint}</p>
      {pesanan.catatan && <p className="mt-2 rounded-lg bg-surface-muted p-2.5 text-xs italic text-ink-500">&ldquo;{pesanan.catatan}&rdquo;</p>}
      {pesanan.telepon ? (
        <LinkButton href={waLink(pesanan.telepon, pesanWa)} external size="sm" className="mt-3 w-full">
          <MessageCircle className="h-3.5 w-3.5" />
          Hubungi Warga via WhatsApp
        </LinkButton>
      ) : (
        <Button variant="secondary" size="sm" disabled className="mt-3 w-full">
          Nomor warga belum tersedia
        </Button>
      )}
    </div>
  );
}

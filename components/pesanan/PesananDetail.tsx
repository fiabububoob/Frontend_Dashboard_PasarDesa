"use client";

import { Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDetail } from "@/components/detail/DetailProvider";
import { TANGGAL_DATA_DUMMY } from "@/lib/constants";
import { AlurEkspedisi } from "./detail/AlurEkspedisi";
import { KartuKurir } from "./detail/KartuKurir";
import { KartuPembeli } from "./detail/KartuPembeli";
import { RincianPesanan } from "./detail/RincianPesanan";
import { StatusActionButton } from "./StatusActionButton";
import type { Pesanan, StatusKemas } from "@/types";

const CATATAN_AKSI: Record<StatusKemas, string> = {
  "perlu-dikemas": "Segel QR code akan digenerate saat status diubah siap jemput.",
  "siap-jemput": "Segel QR sudah dibuat. Menunggu kurir desa menjemput paket.",
  "sedang-dikemas": "Paket sedang dibawa kurir ke drop-point tujuan.",
  selesai: "Paket sudah sampai di drop-point dan siap diambil pembeli.",
};

// Panel detail satu pesanan: hanya merangkai bagian-bagiannya (alur, rincian,
// kartu pembeli & kurir, tombol aksi). Logika tiap bagian ada di ./detail/*.
export function PesananDetail({ pesanan }: { pesanan: Pesanan }) {
  const { open } = useDetail();

  return (
    <Card className="space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
            Pesanan #{pesanan.id}
            <Badge tone="success">Terverifikasi Kas Desa</Badge>
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            Waktu masuk: Hari ini, {TANGGAL_DATA_DUMMY} pukul {pesanan.waktu}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => open({ type: "nota", id: pesanan.id })}>
          <Printer className="h-3.5 w-3.5" />
          Cetak Nota &amp; Label Drop-Point
        </Button>
      </div>

      <AlurEkspedisi status={pesanan.status} />
      <RincianPesanan pesanan={pesanan} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KartuPembeli pesanan={pesanan} />
        <KartuKurir pesanan={pesanan} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-400">{CATATAN_AKSI[pesanan.status]}</p>
        <StatusActionButton key={`${pesanan.id}-${pesanan.status}`} pesanan={pesanan} />
      </div>
    </Card>
  );
}

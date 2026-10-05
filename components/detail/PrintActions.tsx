"use client";

import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDetail } from "./DetailProvider";

interface PrintActionsProps {
  /** Label tombol cetak, mis. "Cetak Surat Jalan". */
  cetakLabel?: string;
  /** Tombol tambahan di sebelah kiri (mis. "Lihat Pesanan"). */
  children?: ReactNode;
}

// Baris tombol di dasar modal yang bisa dicetak: Tutup + Cetak. Disembunyikan
// saat mencetak (.no-print). Untuk menyimpan PDF, pilih "Simpan sebagai PDF" di dialog cetak.
export function PrintActions({ cetakLabel = "Cetak", children }: PrintActionsProps) {
  const { close } = useDetail();
  return (
    <div className="no-print flex flex-wrap justify-end gap-2">
      {children}
      <Button variant="secondary" onClick={close}>
        Tutup
      </Button>
      <Button onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        {cetakLabel}
      </Button>
    </div>
  );
}

"use client";

import { Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStatusLapak } from "@/components/providers/useStatusLapak";
import { useDetail } from "@/components/detail/DetailProvider";
import { KATEGORI_INDUK } from "@/lib/data/kategori";
import { usePengaturanForm } from "./PengaturanForm";

// Pratinjau langsung: membaca DRAFT, jadi berubah saat nama, komoditas unggulan,
// atau jadwal diedit, sebelum disimpan.
export function LivePreviewCard() {
  const { draft } = usePengaturanForm();
  const { open } = useDetail();
  const { status } = useStatusLapak(draft);

  const kategoriTutup = (status?.kategoriTutup ?? []).map((id) => KATEGORI_INDUK.find((k) => k.id === id)?.nama ?? id);
  const tutup = status ? !status.buka : false;

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold text-ink-500">Tampilan di aplikasi warga</p>

      {status && (
        <p className={`mt-3 flex items-center gap-2 text-xs font-semibold ${tutup ? "text-warn-600" : "text-brand-700"}`}>
          <span className={`h-2 w-2 rounded-full ${tutup ? "bg-warn-600" : "bg-brand-500"}`} aria-hidden />
          {status.label}
          <span className="font-normal text-ink-500">· {status.keterangan}</span>
        </p>
      )}

      <p className="mt-2 text-base font-semibold text-ink-900">{draft.namaLapak || "Nama lapak belum diisi"}</p>

      {draft.komoditasUnggulan.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {draft.komoditasUnggulan.map((t) => (
            <span key={t} className="rounded-full bg-surface-sunken px-2.5 py-1 text-[11px] font-medium text-ink-700">
              {t}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-ink-500">Belum ada komoditas unggulan</p>
      )}

      {kategoriTutup.length > 0 && <p className="mt-3 rounded-lg bg-warn-50 p-2.5 text-xs text-warn-600">Sementara tutup: {kategoriTutup.join(", ")}</p>}

      <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => open({ type: "pratinjau-warga", data: draft })}>
        <Eye className="h-3.5 w-3.5" />
        Lihat seperti pembeli
      </Button>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { useConfirm, type ConfirmOptions } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { LATENSI } from "@/lib/constants";
import { simulateRequest } from "@/lib/fake-api";
import { STATUS_BERIKUTNYA } from "@/lib/pesanan";
import type { Pesanan } from "@/types";

// Satu tombol untuk seluruh alur status: dikemas → siap jemput → dalam antaran
// → selesai. Label, dialog konfirmasi, dan toast berubah mengikuti status.
// Tiap langkah menandai paket fisik yang sulit ditarik kembali, jadi semuanya
// diberi dialog konfirmasi dulu (lihat README: "Kapan memakai dialog konfirmasi").
function langkah(p: Pesanan): { tombol: string; berhasil: string; konfirmasi: ConfirmOptions; toast: { title: string; description: string } } | null {
  const rincian = [
    { label: "Pesanan", value: `#${p.id}` },
    { label: "Pembeli", value: p.pembeli },
    { label: "Drop-point", value: p.dropPoint },
  ];
  switch (p.status) {
    case "perlu-dikemas":
      return {
        tombol: "Tandai Siap Diambil Kurir",
        berhasil: "Siap Diambil",
        konfirmasi: {
          title: "Tandai pesanan siap diambil kurir?",
          description: "Segel QR akan dibuat dan kurir menerima notifikasi jemput.",
          details: rincian,
          confirmLabel: "Ya, Tandai Siap",
        },
        toast: { title: "Pesanan siap diambil kurir", description: "Segel QR sudah dibuat." },
      };
    case "siap-jemput":
      return {
        tombol: "Kurir Sudah Menjemput",
        berhasil: "Dalam Antaran",
        konfirmasi: {
          title: "Konfirmasi paket sudah dijemput kurir?",
          description: "Status berubah menjadi Dalam Antaran menuju drop-point.",
          details: rincian,
          confirmLabel: "Ya, Sudah Dijemput",
        },
        toast: { title: "Paket dalam antaran", description: `#${p.id} menuju ${p.dropPoint}.` },
      };
    case "sedang-dikemas":
      return {
        tombol: "Konfirmasi Tiba di Drop-Point",
        berhasil: "Selesai",
        konfirmasi: {
          title: "Konfirmasi paket sudah tiba di drop-point?",
          description: "Pesanan ditandai selesai dan pembeli dapat mengambil paketnya.",
          details: rincian,
          confirmLabel: "Ya, Sudah Tiba",
        },
        toast: { title: "Pesanan selesai", description: `#${p.id} sudah tiba di drop-point.` },
      };
    default:
      return null;
  }
}

export function StatusActionButton({ pesanan }: { pesanan: Pesanan }) {
  const confirm = useConfirm();
  const toast = useToast();
  const { setStatusPesanan } = useDashboardData();
  const { status, run } = useActionStatus();
  const next = STATUS_BERIKUTNYA[pesanan.status];
  const info = langkah(pesanan);

  if (!next || !info) {
    return (
      <Button disabled variant="secondary">
        Pesanan Selesai
      </Button>
    );
  }
  const target = next;

  async function handleClick() {
    if (!info) return;
    const ok = await confirm(info.konfirmasi);
    if (!ok) return;

    const saved = await run(() => simulateRequest(LATENSI.normal));
    if (saved) {
      setStatusPesanan(pesanan.id, target);
      toast({ type: "success", ...info.toast });
    } else {
      toast({ type: "error", title: "Gagal memperbarui status", description: "Periksa koneksi lalu coba lagi." });
    }
  }

  return (
    <Button status={status} loadingLabel="Menyimpan…" successLabel={info.berhasil} onClick={handleClick}>
      {info.tombol}
    </Button>
  );
}

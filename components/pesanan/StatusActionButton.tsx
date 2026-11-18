"use client";

import { Button } from "@/components/ui/Button";
import { useConfirm, type ConfirmOptions } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useDashboardData } from "@/components/providers/DashboardDataProvider";
import { LATENSI, MODE_DEMO } from "@/lib/constants";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { simulateRequest } from "@/lib/fake-api";
import { buatKomplainContoh, bisaDikomplain } from "@/lib/komplain";
import { langkahBerikutnya, type PeranPesanan } from "@/lib/pesanan";
import type { Pesanan, StatusPesanan } from "@/types";

interface DeskripsiLangkah {
  tombol: string;
  berhasil: string;
  konfirmasi: ConfirmOptions;
  toast: { title: string; description: string };
}

// Teks tombol, dialog konfirmasi, dan toast untuk langkah yang dikerjakan PENJUAL (keputusan D4).
// Tiap langkah menandai paket fisik yang sulit ditarik kembali, jadi semuanya diberi dialog konfirmasi.
function deskripsiLangkah(p: Pesanan, ke: StatusPesanan): DeskripsiLangkah | null {
  const rincian = [
    { label: "Pesanan", value: `#${p.id}` },
    { label: "Pembeli", value: p.pembeli },
    { label: "Drop-point", value: p.dropPoint },
  ];
  switch (ke) {
    case "siap-jemput":
      return {
        tombol: "Tandai Siap Diambil Kurir",
        berhasil: "Siap Diambil",
        konfirmasi: { title: "Tandai pesanan siap diambil kurir?", description: "Segel QR akan dibuat dan BUMDes menugaskan kurir untuk menjemput.", details: rincian, confirmLabel: "Ya, Tandai Siap" },
        toast: { title: "Pesanan siap diambil", description: "Segel QR sudah dibuat. BUMDes akan menugaskan kurir." },
      };
    case "diantar":
      return {
        tombol: "Kurir Sudah Menjemput",
        berhasil: "Dalam Antaran",
        konfirmasi: { title: "Konfirmasi paket sudah dijemput kurir?", description: "Status berubah menjadi Dalam Antaran menuju drop-point.", details: rincian, confirmLabel: "Ya, Sudah Dijemput" },
        toast: { title: "Paket dalam antaran", description: `#${p.id} menuju ${p.dropPoint}.` },
      };
    case "tiba-di-pos":
      return {
        tombol: p.opsiPengiriman === "ambil-mandiri" ? "Konfirmasi Paket Sudah di Pos" : "Konfirmasi Tiba di Drop-Point",
        berhasil: "Tiba di Pos",
        konfirmasi: {
          title: "Konfirmasi paket sudah ada di pos?",
          description: "Pembeli akan diminta menekan \"Pesanan Diterima\". Dana Anda dilepas setelah itu, atau otomatis bila pembeli tidak merespons.",
          details: rincian,
          confirmLabel: "Ya, Paket di Pos",
        },
        toast: { title: "Paket tiba di pos", description: "Menunggu pembeli menerima pesanan." },
      };
    default:
      return null;
  }
}

const TEKS_MENUNGGU: Partial<Record<StatusPesanan, string>> = {
  "menunggu-pembayaran": "Menunggu pembayaran pembeli (otomatis lanjut setelah lunas).",
  "tiba-di-pos": "Menunggu pembeli menekan \"Pesanan Diterima\".",
};

// Teks tombol nonaktif bila tidak ada langkah berikutnya untuk penjual.
const TEKS_UJUNG: Partial<Record<StatusPesanan, string>> = {
  dibatalkan: "Pesanan Dibatalkan",
  komplain: "Tangani komplain di atas",
  selesai: "Pesanan Selesai",
};

// Simulasi untuk langkah yang di aplikasi sungguhan dikerjakan pihak lain (hanya MODE_DEMO).
const SIMULASI: Record<Exclude<PeranPesanan, "penjual">, { tombol: string; judul: string; deskripsi: string }> = {
  sistem: { tombol: "Simulasi sistem: pembayaran terverifikasi", judul: "Simulasi: pembayaran terverifikasi", deskripsi: "Pesanan masuk antrean kemas." },
  pembeli: { tombol: "Simulasi pembeli: Pesanan Diterima", judul: "Simulasi: pembeli menerima pesanan", deskripsi: "Dana dilepas ke saldo aktif Anda." },
};

// Satu tombol untuk langkah yang MENJADI TANGGUNG JAWAB PENJUAL. Langkah milik pembeli/sistem
// tampil sebagai keterangan menunggu; ujung alur (selesai/dibatalkan) menampilkan tombol nonaktif.
export function StatusActionButton({ pesanan }: { pesanan: Pesanan }) {
  const confirm = useConfirm();
  const toast = useToast();
  const { setStatusPesanan, ajukanKomplain, pesanan: semuaPesanan } = useDashboardData();
  const { status, run } = useActionStatus();
  const langkah = langkahBerikutnya(pesanan);
  const info = langkah ? deskripsiLangkah(pesanan, langkah.ke) : null;

  if (!langkah) {
    return (
      <Button disabled variant="secondary">
        {TEKS_UJUNG[pesanan.status] ?? "Pesanan Selesai"}
      </Button>
    );
  }

  if (langkah.oleh !== "penjual" || !info) {
    const oleh = langkah.oleh;
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm text-ink-500">{TEKS_MENUNGGU[pesanan.status] ?? "Menunggu pihak lain."}</p>
        {/* Alat pengembangan: meniru sistem/pembeli. Hilang di build produksi. */}
        {MODE_DEMO && oleh !== "penjual" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusPesanan(pesanan.id, langkah.ke);
              toast({ type: "info", title: SIMULASI[oleh].judul, description: SIMULASI[oleh].deskripsi });
            }}
          >
            {SIMULASI[oleh].tombol} (mode pengembangan)
          </Button>
        )}
        {MODE_DEMO && bisaDikomplain(pesanan) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const urutan = semuaPesanan.filter((p) => p.komplain).length + 1;
              ajukanKomplain(pesanan.id, buatKomplainContoh(pesanan, new Date(), urutan));
              toast({ type: "info", title: "Simulasi: pembeli mengajukan komplain", description: "Dana pesanan ditahan sampai komplain selesai." });
            }}
          >
            Simulasi pembeli: ajukan komplain (mode pengembangan)
          </Button>
        )}
      </div>
    );
  }

  async function handleClick() {
    if (!langkah || !info) return;
    const ok = await confirm(info.konfirmasi);
    if (!ok) return;

    const saved = await run(() => simulateRequest(LATENSI.normal));
    if (saved) {
      setStatusPesanan(pesanan.id, langkah.ke);
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

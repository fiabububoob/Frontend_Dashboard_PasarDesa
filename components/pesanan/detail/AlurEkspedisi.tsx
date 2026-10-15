import { CheckCircle2, XCircle } from "lucide-react";
import type { StatusPesanan } from "@/types";

const LANGKAH = ["Diterima", "Sedang Dikemas", "Kurir Menjemput", "Drop-Point Diambil"];

// Indeks langkah yang sedang berjalan untuk tiap status (selesai = semua langkah tuntas).
// Pesanan ambil mandiri melewati "diantar", tetapi stepper tetap sama agar mudah dibaca.
const LANGKAH_AKTIF: Record<Exclude<StatusPesanan, "dibatalkan">, number> = {
  "menunggu-pembayaran": 0,
  "perlu-dikemas": 1,
  "siap-jemput": 2,
  diantar: 3,
  "tiba-di-pos": 4,
  komplain: 4, // paket sudah di pos; menunggu komplain selesai sebelum diterima
  selesai: LANGKAH.length,
};

const ESTIMASI_TIBA = "Estimasi 15:30";

function warnaLangkah(index: number, aktif: number) {
  if (index < aktif) return "bg-brand-600 text-white";
  if (index === aktif) return "bg-warn-400 text-white";
  return "bg-surface-sunken text-ink-400";
}

// Stepper 4 langkah: lingkaran berubah warna & isi (angka → centang) mengikuti status.
// Pesanan yang dibatalkan menampilkan pemberitahuan merah, bukan stepper.
export function AlurEkspedisi({ status }: { status: StatusPesanan }) {
  if (status === "dibatalkan") {
    return (
      <div role="status" className="flex items-center gap-2 rounded-lg bg-danger-50 p-3 text-sm font-medium text-danger-600">
        <XCircle className="h-4 w-4 shrink-0" aria-hidden />
        Pesanan ini dibatalkan. Tidak ada yang perlu dikemas.
      </div>
    );
  }
  const aktif = LANGKAH_AKTIF[status];

  return (
    <div>
      <p className="text-xs font-medium uppercase text-ink-400">Alur Ekspedisi Lokal Sukorejo</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {LANGKAH.map((nama, i) => (
          <div key={nama} className="flex flex-col items-center gap-1.5 text-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-move ease-move ${warnaLangkah(i, aktif)}`}>
              {i < aktif ? <CheckCircle2 className="h-4 w-4 animate-pop" /> : <span className="text-xs font-semibold">{i + 1}</span>}
            </div>
            <p className="text-xs font-medium text-ink-900">{nama}</p>
            {i === aktif && <p className="text-[11px] text-ink-500">{ESTIMASI_TIBA}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

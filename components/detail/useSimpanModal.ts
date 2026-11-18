"use client";

import { useToast } from "@/components/ui/Toast";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { LATENSI, TUTUP_MODAL_SETELAH_SIMPAN_MS } from "@/lib/constants";
import { useDetail } from "./DetailProvider";

interface PesanSukses {
  title: string;
  description?: string;
}

// Alur simpan yang sama untuk semua form di modal/panel:
//   jalankan `terapkan` → (gagal: toast error berisi pesan galat) → (sukses: toast, tutup).
// `terapkan` boleh async (panggilan ke server): bila melempar Error, pesannya ditampilkan apa adanya.
// Mengembalikan pesan toast sukses.
export function useSimpanModal(pesanGagal: string) {
  const { close } = useDetail();
  const toast = useToast();
  const { status, run } = useActionStatus(LATENSI.normal);

  async function simpan(terapkan: () => PesanSukses | Promise<PesanSukses>) {
    let pesan: PesanSukses | undefined;
    let galat = "Coba lagi sebentar lagi.";
    const berhasil = await run(async () => {
      try {
        pesan = await terapkan();
      } catch (e) {
        if (e instanceof Error && e.message) galat = e.message;
        throw e;
      }
    });
    if (!berhasil || !pesan) {
      toast({ type: "error", title: pesanGagal, description: galat });
      return;
    }
    toast({ type: "success", ...pesan });
    setTimeout(close, TUTUP_MODAL_SETELAH_SIMPAN_MS);
  }

  return { status, close, simpan };
}

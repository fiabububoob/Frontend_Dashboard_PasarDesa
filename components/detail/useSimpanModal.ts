"use client";

import { useToast } from "@/components/ui/Toast";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { simulateRequest } from "@/lib/fake-api";
import { LATENSI, TUTUP_MODAL_SETELAH_SIMPAN_MS } from "@/lib/constants";
import { useDetail } from "./DetailProvider";

interface PesanSukses {
  title: string;
  description?: string;
}

// Alur simpan yang sama untuk semua form di modal:
//   kirim permintaan → (gagal: toast error) → (sukses: terapkan perubahan, toast, tutup modal).
// `terapkan` dijalankan hanya setelah permintaan berhasil dan mengembalikan pesan toast sukses.
export function useSimpanModal(pesanGagal: string) {
  const { close } = useDetail();
  const toast = useToast();
  const { status, run } = useActionStatus(LATENSI.normal);

  async function simpan(terapkan: () => PesanSukses) {
    const berhasil = await run(() => simulateRequest(LATENSI.normal));
    if (!berhasil) {
      toast({ type: "error", title: pesanGagal, description: "Coba lagi sebentar lagi." });
      return;
    }
    toast({ type: "success", ...terapkan() });
    setTimeout(close, TUTUP_MODAL_SETELAH_SIMPAN_MS);
  }

  return { status, close, simpan };
}

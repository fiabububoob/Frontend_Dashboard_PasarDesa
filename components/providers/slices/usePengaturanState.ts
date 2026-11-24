"use client";

import { useMemo, useState } from "react";
import { PENGATURAN_AWAL, PROFIL_AWAL, TUTUP_AWAL } from "@/lib/data/pengaturan";
import type { PengaturanLapak, ProfilPengguna, TutupSementara } from "@/types";

// State pengaturan lapak (hasil "Simpan Pengaturan"), penutupan sementara, dan profil pengguna.
export function usePengaturanState(profilAwal: ProfilPengguna = PROFIL_AWAL) {
  const [pengaturan, simpanPengaturan] = useState<PengaturanLapak>(PENGATURAN_AWAL);
  const [tutup, setTutup] = useState<TutupSementara>(TUTUP_AWAL);
  const [profil, ubahProfil] = useState<ProfilPengguna>(profilAwal);

  return useMemo(
    () => ({ pengaturan, simpanPengaturan, tutup, setTutup, profil, ubahProfil }),
    [pengaturan, simpanPengaturan, tutup, setTutup, profil, ubahProfil],
  );
}

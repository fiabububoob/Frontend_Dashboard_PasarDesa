"use client";

import { useMemo, useState } from "react";
import { PENGATURAN_AWAL, PROFIL_AWAL } from "@/lib/data/pengaturan";
import type { PengaturanLapak, ProfilPengguna } from "@/types";

// State pengaturan lapak (hasil "Simpan Pengaturan"), mode jeda tanam, dan profil pengguna.
export function usePengaturanState(profilAwal: ProfilPengguna = PROFIL_AWAL) {
  const [pengaturan, simpanPengaturan] = useState<PengaturanLapak>(PENGATURAN_AWAL);
  const [jedaTanam, setJedaTanam] = useState(false);
  const [profil, ubahProfil] = useState<ProfilPengguna>(profilAwal);

  return useMemo(
    () => ({ pengaturan, simpanPengaturan, jedaTanam, setJedaTanam, profil, ubahProfil }),
    [pengaturan, simpanPengaturan, jedaTanam, setJedaTanam, profil, ubahProfil],
  );
}

"use client";

import { useMemo, useState } from "react";
import { PENGATURAN_AWAL, PROFIL_AWAL } from "@/lib/data/pengaturan";
import type { PengaturanLapak, ProfilPengguna } from "@/types";

// State pengaturan lapak (hasil "Simpan Pengaturan"), mode jeda tanam, dan profil pengguna.
export function usePengaturanState() {
  const [pengaturan, simpanPengaturan] = useState<PengaturanLapak>(PENGATURAN_AWAL);
  const [jedaTanam, setJedaTanam] = useState(false);
  const [profil, ubahProfil] = useState<ProfilPengguna>(PROFIL_AWAL);

  return useMemo(
    () => ({ pengaturan, simpanPengaturan, jedaTanam, setJedaTanam, profil, ubahProfil }),
    [pengaturan, simpanPengaturan, jedaTanam, setJedaTanam, profil, ubahProfil],
  );
}

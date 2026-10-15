// Daftar peran/jabatan akun admin. SATU sumber kebenaran: dipakai form register (pilihan select)
// dan Server Action aksiRegister (validasi). Tanpa "server-only" karena form (client) ikut mengimpornya.
export const DAFTAR_PERAN: readonly string[] = ["Super Admin BUMDes (Akses Penuh)", "Verifikator Komoditas", "Petugas Keuangan", "Kurir Desa"];

export const PERAN_BAWAAN: string = DAFTAR_PERAN[0];
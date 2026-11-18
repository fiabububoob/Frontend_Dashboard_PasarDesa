// Foto dari pembeli (bukti komplain/aduan, foto ulasan) diunggah lewat backend dan dirujuk dengan alamat berbentuk
// `http://<host-saat-unggah>/uploads/...`. Host itu bisa tidak terjangkau dari browser admin (mis. 10.0.2.2 dari
// emulator), jadi hanya bagian `/uploads/...` yang dipakai; next.config.js meneruskannya ke server backend.
export function urlFoto(url: string | undefined | null): string {
  if (!url) return "";
  const i = url.indexOf("/uploads/");
  if (i < 0) return url; // data URL atau alamat lain: apa adanya
  return url.slice(i).split("?")[0];
}

export const daftarFoto = (nilai: string[] | string | null | undefined): string[] => {
  let daftar: unknown = nilai;
  if (typeof nilai === "string") {
    try {
      daftar = JSON.parse(nilai);
    } catch {
      daftar = [];
    }
  }
  return Array.isArray(daftar) ? daftar.map((u) => urlFoto(String(u))).filter(Boolean) : [];
};

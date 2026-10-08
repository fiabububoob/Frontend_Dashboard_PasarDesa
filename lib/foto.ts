import { KUALITAS_FOTO, MAKS_SISI_FOTO_PX, MAKS_UKURAN_FOTO_PRODUK_BYTES } from "./constants";

export const FORMAT_FOTO_PRODUK = ["image/jpeg", "image/png", "image/webp"];

// Pesan error bila file tidak boleh dipakai; null bila valid. Fungsi murni → mudah diuji.
export function validasiFoto(file: { type: string; size: number }): string | null {
  if (!FORMAT_FOTO_PRODUK.includes(file.type)) return "Format harus JPG, PNG, atau WebP.";
  if (file.size > MAKS_UKURAN_FOTO_PRODUK_BYTES) return `Ukuran maksimal ${MAKS_UKURAN_FOTO_PRODUK_BYTES / 1024 / 1024} MB.`;
  return null;
}

// Memperkecil gambar agar sisi terpanjangnya <= maksSisi, dengan menjaga rasio. Tidak pernah memperbesar.
export function ukuranBaru(lebar: number, tinggi: number, maksSisi: number = MAKS_SISI_FOTO_PX) {
  const skala = Math.min(1, maksSisi / Math.max(lebar, tinggi));
  return { lebar: Math.round(lebar * skala), tinggi: Math.round(tinggi * skala) };
}

function muatGambar(src: string): Promise<HTMLImageElement> {
  return new Promise((selesai, gagal) => {
    const gambar = new Image();
    gambar.onload = () => selesai(gambar);
    gambar.onerror = () => gagal(new Error("Gambar tidak bisa dibaca"));
    gambar.src = src;
  });
}

// Browser saja: memperkecil foto lalu mengubahnya jadi data URL JPEG. Foto asli 5 MB
// biasanya menyusut jadi < 300 KB, jadi aman disimpan di memori sebelum ada backend upload.
export async function kompresFoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const gambar = await muatGambar(url);
    const { lebar, tinggi } = ukuranBaru(gambar.naturalWidth, gambar.naturalHeight);
    const kanvas = document.createElement("canvas");
    kanvas.width = lebar;
    kanvas.height = tinggi;
    const konteks = kanvas.getContext("2d");
    if (!konteks) throw new Error("Browser tidak mendukung pengolahan gambar");
    konteks.fillStyle = "white"; // PNG transparan → latar putih, bukan hitam
    konteks.fillRect(0, 0, lebar, tinggi);
    konteks.drawImage(gambar, 0, 0, lebar, tinggi);
    return kanvas.toDataURL("image/jpeg", KUALITAS_FOTO);
  } finally {
    URL.revokeObjectURL(url);
  }
}
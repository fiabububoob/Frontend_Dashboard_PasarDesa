// ---------------------------------------------------------------------------
// Definisi tipe dibagi per domain (komoditas, pesanan, kas, pengaturan, …) dan
// diekspor ulang di sini, jadi impor tetap `from "@/types"`.
//
// Saat backend (Express API) siap, tipe-tipe inilah yang disesuaikan dengan
// respons API; komponen tidak perlu ditulis ulang karena hanya memakai tipe ini.
// ---------------------------------------------------------------------------
export * from "./ui";
export * from "./komoditas";
export * from "./pesanan";
export * from "./kas";
export * from "./pengaturan";
export * from "./detail";

// ---------------------------------------------------------------------------
// Shared formatters. Currency/number/date formatting shows up on every page
// (stat cards, tables, forms, print views) — defining it once here avoids
// subtly inconsistent formatting drifting across components over time.
// ---------------------------------------------------------------------------

const LOCALE = "id-ID";
export const ZONA_WAKTU = "Asia/Jakarta";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

// Dibangun dari formatNumber (bukan Intl currency) karena Intl menyisipkan
// non-breaking space setelah "Rp" sehingga hasilnya bisa tampak berspasi ganda.
export function formatRupiah(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}Rp ${formatNumber(Math.abs(value))}`;
}

// Tanggal dalam WIB. "full" → "Senin, 5 Oktober 2026"; "long" → "5 Oktober 2026".
export function formatTanggal(date: Date, gaya: "full" | "long" = "long"): string {
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: gaya, timeZone: ZONA_WAKTU }).format(date);
}

// Jam dalam WIB, mis. "14:05" atau "14:05:33". Intl id-ID memakai titik sebagai pemisah → diganti titik dua.
export function formatJam(date: Date, denganDetik = false): string {
  const jam = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    second: denganDetik ? "2-digit" : undefined,
    hour12: false,
    timeZone: ZONA_WAKTU,
  }).format(date);
  return jam.replace(/\./g, ":");
}

// Jam sekarang dengan zona, mis. "14:05 WIB". Dipanggil saat aksi (bukan saat render) → aman dari mismatch hydration.
export function waktuWib(date: Date = new Date()): string {
  return `${formatJam(date)} WIB`;
}

// Tautan WhatsApp (wa.me) dari nomor lokal "0812…". `pesan` opsional, terisi otomatis di chat.
export function waLink(telepon: string, pesan?: string): string {
  const base = `https://wa.me/62${telepon.replace(/\D/g, "").replace(/^0/, "")}`;
  return pesan ? `${base}?text=${encodeURIComponent(pesan)}` : base;
}

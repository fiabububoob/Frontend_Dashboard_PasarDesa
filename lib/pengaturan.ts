import type { JadwalOperasional, PengaturanLapak, StatusJadwal } from "@/types";

export const STATUS_JADWAL_LABEL: Record<StatusJadwal, string> = {
  "buka-penuh": "Buka Penuh",
  "buka-siang": "Buka Siang",
  khusus: "Khusus Panen Raya",
  tutup: "Tutup",
};

const menit = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Validasi satu jadwal: jam tutup harus setelah jam buka, dan batas order
// (cut-off) harus berada di antara keduanya. Hari "Tutup" tidak divalidasi.
// Mengembalikan peta {indeks baris → pesan error}.
export function cekJadwal(jadwal: JadwalOperasional[]): Record<number, string> {
  const errors: Record<number, string> = {};
  jadwal.forEach((row, i) => {
    if (row.status === "tutup") return;
    if (!row.buka || !row.tutup || !row.cutOff) errors[i] = "Jam buka, tutup, dan batas order wajib diisi";
    else if (menit(row.tutup) <= menit(row.buka)) errors[i] = "Jam tutup harus setelah jam buka";
    else if (menit(row.cutOff) < menit(row.buka) || menit(row.cutOff) > menit(row.tutup)) errors[i] = "Batas order harus di antara jam buka dan tutup";
  });
  return errors;
}

// Hari & jam sekarang dalam WIB: weekday 0=Minggu … 6=Sabtu.
function wibNow(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { weekday, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

// Baris jadwal yang berlaku untuk hari tertentu (tabel memakai 4 baris: Senin,
// Selasa–Jumat, Sabtu, Minggu).
export function jadwalHariIni(jadwal: JadwalOperasional[], date: Date): JadwalOperasional | undefined {
  const { weekday } = wibNow(date);
  const idx = weekday === 1 ? 0 : weekday >= 2 && weekday <= 5 ? 1 : weekday === 6 ? 2 : 3;
  return jadwal[idx];
}

export type KodeStatusLapak = "buka" | "jeda" | "libur" | "belum-buka" | "sudah-tutup";

export interface StatusLapak {
  kode: KodeStatusLapak;
  buka: boolean;
  label: string; // "BUKA SEKARANG"
  keterangan: string; // "Hingga 17:30 WIB"
}

// Status lapak untuk pembeli, dihitung dari jadwal + mode jeda tanam + jam sekarang.
export function statusLapak(p: Pick<PengaturanLapak, "jadwal">, jedaTanam: boolean, date: Date): StatusLapak {
  if (jedaTanam) return { kode: "jeda", buka: false, label: "TUTUP SEMENTARA", keterangan: "Jeda tanam / cuaca ekstrem" };
  const row = jadwalHariIni(p.jadwal, date);
  if (!row || row.status === "tutup") return { kode: "libur", buka: false, label: "TUTUP HARI INI", keterangan: "Libur operasional" };
  const now = wibNow(date).minutes;
  if (now >= menit(row.buka) && now < menit(row.tutup)) return { kode: "buka", buka: true, label: "BUKA SEKARANG", keterangan: `Hingga ${row.tutup} WIB` };
  if (now < menit(row.buka)) return { kode: "belum-buka", buka: false, label: "BELUM BUKA", keterangan: `Buka pukul ${row.buka} WIB` };
  return { kode: "sudah-tutup", buka: false, label: "SUDAH TUTUP", keterangan: "Buka lagi besok pagi" };
}

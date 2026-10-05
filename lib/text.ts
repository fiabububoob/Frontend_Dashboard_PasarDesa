// Util teks untuk pencarian & filter: tanpa huruf besar/kecil dan tanpa aksen,
// jadi "Cabai" dan "cabaí" dianggap sama.
export function normalisasi(teks: string): string {
  return teks.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// True bila SETIAP kata di `query` ditemukan di salah satu bidang (urutan bebas),
// sehingga "cabai kritis" atau "joko 0089" tetap cocok. Query kosong cocok dengan semuanya.
export function cocokSemuaKata(query: string, ...bidang: (string | undefined)[]): boolean {
  const kata = normalisasi(query).split(/\s+/).filter(Boolean);
  if (kata.length === 0) return true;
  const teks = normalisasi(bidang.filter(Boolean).join(" "));
  return kata.every((k) => teks.includes(k));
}

// Inisial dari dua kata pertama: "Pak Sutrisno" → "PS".
export function inisial(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .map((kata) => kata[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

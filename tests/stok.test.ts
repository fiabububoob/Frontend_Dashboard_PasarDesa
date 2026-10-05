import { describe, expect, it } from "vitest";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { AMBANG_KRITIS, cariKomoditasByNama, hitungKritis, hitungStatusStok, kategoriList } from "@/lib/stok";

describe("hitungStatusStok", () => {
  it("kritis di bawah ambang", () => {
    expect(hitungStatusStok(AMBANG_KRITIS - 1, 100)).toBe("kritis");
  });
  it("menengah sampai 40% kapasitas", () => {
    expect(hitungStatusStok(40, 100)).toBe("menengah");
  });
  it("aman di atas 40%", () => {
    expect(hitungStatusStok(41, 100)).toBe("aman");
  });
});

describe("kategoriList", () => {
  it("menghitung jumlah dan stok kritis per kategori", () => {
    const hasil = kategoriList(KOMODITAS_LIST);
    expect(hasil.reduce((sum, k) => sum + k.count, 0)).toBe(KOMODITAS_LIST.length);
    expect(hasil.reduce((sum, k) => sum + k.kritis, 0)).toBe(hitungKritis(KOMODITAS_LIST));
  });
});

describe("cariKomoditasByNama", () => {
  it("mencocokkan lewat dua kata pertama", () => {
    expect(cariKomoditasByNama(KOMODITAS_LIST, "Cabai Rawit 500g")?.nama).toContain("Cabai Rawit");
  });
  it("mengembalikan undefined bila tidak ada", () => {
    expect(cariKomoditasByNama(KOMODITAS_LIST, "Durian Montong")).toBeUndefined();
  });
});

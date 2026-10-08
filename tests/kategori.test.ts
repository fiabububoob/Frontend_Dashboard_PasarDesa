import { describe, expect, it } from "vitest";
import { KATEGORI_INDUK } from "@/lib/data/kategori";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { IKON_SUB_KATEGORI, NAMA_SUB_KATEGORI, indukDari, subDariInduk } from "@/lib/kategori";

describe("pohon kategori", () => {
  it("punya 4 kategori besar dan 10 sub-kategori (keputusan D3)", () => {
    expect(KATEGORI_INDUK).toHaveLength(4);
    expect(NAMA_SUB_KATEGORI).toHaveLength(10);
  });
  it("nama sub-kategori unik dan semuanya punya ikon", () => {
    expect(new Set(NAMA_SUB_KATEGORI).size).toBe(NAMA_SUB_KATEGORI.length);
    expect(NAMA_SUB_KATEGORI.every((nama) => Boolean(IKON_SUB_KATEGORI[nama]))).toBe(true);
  });
});

describe("indukDari & subDariInduk", () => {
  it("mencari kategori besar dari sub-kategori", () => {
    expect(indukDari("Beras & Gabah")?.nama).toBe("Hasil Tani");
    expect(indukDari("Telur & Ayam")?.nama).toBe("Ternak Ikan");
    expect(indukDari("Tidak Ada")).toBeUndefined();
  });
  it("mendaftar sub-kategori dari kategori besar", () => {
    expect(subDariInduk("UMKM Desa")).toHaveLength(5);
    expect(subDariInduk("Tidak Ada")).toEqual([]);
  });
});

describe("data dummy komoditas", () => {
  it("semua komoditas memakai sub-kategori yang ada di pohon", () => {
    expect(KOMODITAS_LIST.every((k) => NAMA_SUB_KATEGORI.includes(k.kategori))).toBe(true);
  });
});
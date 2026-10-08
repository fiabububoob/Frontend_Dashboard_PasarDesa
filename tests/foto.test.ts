import { describe, expect, it } from "vitest";
import { MAKS_SISI_FOTO_PX, MAKS_UKURAN_FOTO_PRODUK_BYTES } from "@/lib/constants";
import { ukuranBaru, validasiFoto } from "@/lib/foto";

describe("validasiFoto", () => {
  it("menerima JPG, PNG, dan WebP dalam batas ukuran", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) expect(validasiFoto({ type, size: 1000 })).toBe(null);
  });
  it("menolak format lain", () => {
    expect(validasiFoto({ type: "image/gif", size: 1000 })).toContain("Format");
    expect(validasiFoto({ type: "application/pdf", size: 1000 })).toContain("Format");
  });
  it("menolak file yang terlalu besar", () => {
    expect(validasiFoto({ type: "image/jpeg", size: MAKS_UKURAN_FOTO_PRODUK_BYTES + 1 })).toContain("Ukuran");
  });
});

describe("ukuranBaru", () => {
  it("memperkecil sisi terpanjang sambil menjaga rasio", () => {
    expect(ukuranBaru(4000, 2000)).toEqual({ lebar: MAKS_SISI_FOTO_PX, tinggi: MAKS_SISI_FOTO_PX / 2 });
    expect(ukuranBaru(1000, 3000, 1000)).toEqual({ lebar: 333, tinggi: 1000 });
  });
  it("tidak pernah memperbesar gambar kecil", () => {
    expect(ukuranBaru(400, 300)).toEqual({ lebar: 400, tinggi: 300 });
  });
});
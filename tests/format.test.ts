import { describe, expect, it } from "vitest";
import { formatJam, formatRupiah, waLink, waktuWib } from "@/lib/format";

describe("formatRupiah", () => {
  it("memakai pemisah ribuan titik dan satu spasi setelah Rp", () => {
    expect(formatRupiah(4620000)).toBe("Rp 4.620.000");
  });
  it("menaruh tanda minus di depan", () => {
    expect(formatRupiah(-50000)).toBe("-Rp 50.000");
  });
});

describe("waLink", () => {
  it("mengubah nomor lokal ke format internasional", () => {
    expect(waLink("0812-3456-7890")).toBe("https://wa.me/6281234567890");
  });
  it("menyertakan pesan yang di-encode", () => {
    expect(waLink("0812", "Halo dunia")).toBe("https://wa.me/62812?text=Halo%20dunia");
  });
});

describe("jam WIB", () => {
  const siang = new Date("2023-10-23T07:05:09Z"); // 14:05:09 WIB
  it("formatJam memakai titik dua dan zona WIB", () => {
    expect(formatJam(siang)).toBe("14:05");
    expect(formatJam(siang, true)).toBe("14:05:09");
  });
  it("waktuWib menambahkan zona", () => {
    expect(waktuWib(siang)).toBe("14:05 WIB");
  });
});

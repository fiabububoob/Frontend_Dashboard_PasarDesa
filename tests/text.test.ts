import { describe, expect, it } from "vitest";
import { cocokSemuaKata, inisial, normalisasi } from "@/lib/text";

describe("normalisasi", () => {
  it("menurunkan huruf dan membuang aksen", () => {
    expect(normalisasi("CabaÍ Rawit")).toBe("cabai rawit");
  });
});

describe("cocokSemuaKata", () => {
  it("cocok bila semua kata ada, urutan bebas", () => {
    expect(cocokSemuaKata("kritis cabai", "Cabai Rawit Merah", "stok kritis")).toBe(true);
  });
  it("tidak cocok bila ada satu kata yang hilang", () => {
    expect(cocokSemuaKata("cabai jagung", "Cabai Rawit Merah")).toBe(false);
  });
  it("query kosong cocok dengan semuanya", () => {
    expect(cocokSemuaKata("   ", "apa saja")).toBe(true);
  });
  it("mengabaikan bidang undefined", () => {
    expect(cocokSemuaKata("organik", undefined, "Beras Organik")).toBe(true);
  });
});

describe("inisial", () => {
  it("mengambil huruf pertama dua kata pertama", () => {
    expect(inisial("Pak Sutrisno")).toBe("PS");
    expect(inisial("Budi")).toBe("B");
    expect(inisial("  ")).toBe("");
  });
});

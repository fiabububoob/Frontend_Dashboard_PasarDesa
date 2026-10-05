import { describe, expect, it } from "vitest";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { PESANAN_LIST } from "@/lib/data/pesanan";
import { hitungKritis } from "@/lib/stok";
import { buatNotifikasi } from "@/lib/notifikasi";

describe("buatNotifikasi", () => {
  it("satu notifikasi per komoditas kritis, plus dikemas/kurir/pengumuman", () => {
    const hasil = buatNotifikasi({ pesanan: PESANAN_LIST, komoditas: KOMODITAS_LIST });
    expect(hasil.filter((n) => n.jenis === "stok-kritis")).toHaveLength(hitungKritis(KOMODITAS_LIST));
    expect(hasil.some((n) => n.jenis === "dikemas")).toBe(true);
    expect(hasil.some((n) => n.jenis === "kurir")).toBe(true);
    expect(hasil.some((n) => n.jenis === "pengumuman")).toBe(true);
  });
  it("tanpa pesanan perlu dikemas, notifikasi dikemas hilang", () => {
    const selesai = PESANAN_LIST.map((p) => ({ ...p, status: "selesai" as const }));
    expect(buatNotifikasi({ pesanan: selesai, komoditas: KOMODITAS_LIST }).some((n) => n.jenis === "dikemas")).toBe(false);
  });
  it("kunci notifikasi unik", () => {
    const keys = buatNotifikasi({ pesanan: PESANAN_LIST, komoditas: KOMODITAS_LIST }).map((n) => n.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

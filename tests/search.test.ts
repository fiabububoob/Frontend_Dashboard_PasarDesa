import { describe, expect, it } from "vitest";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { KAS_TRANSAKSI } from "@/lib/data/kas";
import { PESANAN_LIST } from "@/lib/data/pesanan";
import { WARTA_LIST } from "@/lib/data/ringkasan";
import { cari } from "@/lib/search";

const DATA = { komoditas: KOMODITAS_LIST, pesanan: PESANAN_LIST, transaksi: KAS_TRANSAKSI, warta: WARTA_LIST };

describe("cari", () => {
  it("query kosong tidak menghasilkan apa pun", () => {
    expect(cari("  ", DATA)).toEqual([]);
  });
  it("menemukan komoditas dan membuka target komoditas", () => {
    const hasil = cari("tomat", DATA).find((h) => h.grup === "Komoditas");
    expect(hasil?.target.type).toBe("komoditas");
  });
  it("menemukan pesanan lewat nama pembeli", () => {
    const hasil = cari("joko", DATA).find((h) => h.grup === "Pesanan");
    expect(hasil?.target).toEqual({ type: "pesanan", id: "PSD-20231024-0089" });
  });
  it("menemukan kategori", () => {
    expect(cari("ternak", DATA).some((h) => h.grup === "Kategori")).toBe(true);
  });
  it("membatasi jumlah hasil per grup", () => {
    const perGrup = cari("a", DATA).filter((h) => h.grup === "Pesanan");
    expect(perGrup.length).toBeLessThanOrEqual(5);
  });
});

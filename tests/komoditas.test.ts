import { describe, expect, it } from "vitest";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { buatKomoditas, buatSkuBaru, kodeSku, tambahStokKomoditas, ubahKomoditas } from "@/lib/komoditas";
import type { KomoditasBaru } from "@/types";

const BARU: KomoditasBaru = { nama: "Kacang Tanah Kupas", gambar: "🥜", kategori: "Dapur & Rumah", asalBlok: "Blok A", harga: 28000, satuan: "kg", stok: 20, stokMaks: 40 };

describe("kodeSku", () => {
  it("mengambil tiga huruf pertama (huruf besar)", () => {
    expect(kodeSku("Beras Merah")).toBe("BER");
  });
  it("memakai kode bawaan bila nama tanpa huruf", () => {
    expect(kodeSku("123")).toBe("KMD");
  });
  it("melengkapi nama pendek dengan X", () => {
    expect(kodeSku("Ab")).toBe("ABX");
  });
});

describe("buatSkuBaru", () => {
  it("tidak pernah bentrok dengan SKU yang sudah ada", () => {
    const sku1 = buatSkuBaru(KOMODITAS_LIST, "Kacang Tanah");
    const sku2 = buatSkuBaru([...KOMODITAS_LIST, { ...KOMODITAS_LIST[0], id: sku1, sku: sku1 }], "Kacang Tanah");
    expect(sku2).not.toBe(sku1);
  });
});

describe("buatKomoditas", () => {
  it("melengkapi id, status stok, dan tampil=true", () => {
    const k = buatKomoditas(KOMODITAS_LIST, BARU);
    expect(k.id).toBe(k.sku);
    expect(k.statusStok).toBe("aman"); // 20 dari 40 = 50% > 40%
    expect(k.tampil).toBe(true);
  });
  it("stok rendah dihitung menengah/kritis", () => {
    expect(buatKomoditas([], { ...BARU, stok: 10 }).statusStok).toBe("menengah");
    expect(buatKomoditas([], { ...BARU, stok: 2 }).statusStok).toBe("kritis");
  });
  it("menjepit stok ke kapasitas", () => {
    expect(buatKomoditas(KOMODITAS_LIST, { ...BARU, stok: 99 }).stok).toBe(40);
  });
});

describe("tambahStokKomoditas", () => {
  it("tidak melebihi kapasitas dan menghitung ulang status", () => {
    const kritis = { ...buatKomoditas([], { ...BARU, stok: 2 }), stokMaks: 40 };
    const hasil = tambahStokKomoditas(kritis, 500);
    expect(hasil.stok).toBe(40);
    expect(hasil.statusStok).toBe("aman");
  });
});

describe("ubahKomoditas", () => {
  it("menjepit stok bila kapasitas diperkecil", () => {
    const k = buatKomoditas([], BARU);
    expect(ubahKomoditas(k, { stokMaks: 10 }).stok).toBe(10);
  });
});

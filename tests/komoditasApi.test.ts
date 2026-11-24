import { describe, expect, it } from "vitest";
import { isianKeApi, komoditasDariApi, type BarisKomoditasApi } from "@/lib/komoditasApi";

const baris: BarisKomoditasApi = {
  id: 7, name: "Beras Pandan Wangi 5kg", description: "Pulen dan wangi", price: "68000.00", harga_coret: "75000.00", stock: "8.000", max_stock: "60.000",
  unit: "sak", ukuran: "5 kg", image: "http://localhost:3000/uploads/products/b.jpg", sku: "SKR-PND-05", origin_block: "Blok Selatan", is_visible: 1, tag: null, price_note: null,
  sumber: "Petani", ketersediaan: "Siap kirim", batas_stok_rendah: "10.000", category_name: "Beras & Padi", terjual: "340.000",
  detail: JSON.stringify({ gambar: "🍚", badge: ["panen-baru"], keunggulan: ["Pulen Alami: musim pertama"], pengiriman: { antarKurir: true, ambilDiKantor: false, bisaDiklaim: true } }),
};

describe("komoditasDariApi", () => {
  it("memetakan kolom, angka desimal teks, dan isi kolom detail", () => {
    const k = komoditasDariApi(baris);
    expect(k).toMatchObject({ id: "7", nama: "Beras Pandan Wangi 5kg", harga: 68000, hargaCoret: 75000, stok: 8, stokMaks: 60, terjual: 340, tampil: true, kategori: "Beras & Padi", gambar: "🍚", badge: ["panen-baru"] });
    expect(k.foto).toEqual(["http://localhost:3000/uploads/products/b.jpg"]);
    expect(k.pengiriman?.antarKurir).toBe(true);
  });

  it("stok di bawah batas buatan penjual dianggap kritis", () => {
    expect(komoditasDariApi(baris).statusStok).toBe("kritis"); // 8 <= 10
    expect(komoditasDariApi({ ...baris, stock: "30" }).statusStok).not.toBe("kritis");
  });

  it("detail rusak/kosong tidak membuat gagal", () => {
    expect(komoditasDariApi({ ...baris, detail: "{rusak" }).gambar).toBe("🌾");
    expect(komoditasDariApi({ ...baris, detail: null }).badge).toBeUndefined();
  });
});

describe("isianKeApi", () => {
  it("bolak-balik: isian yang dikirim bisa dibaca kembali tanpa kehilangan data kaya", () => {
    const k = komoditasDariApi(baris);
    const isian = isianKeApi(k);
    expect(isian).toMatchObject({ name: "Beras Pandan Wangi 5kg", price: "68000", harga_coret: "75000", is_visible: "true", sumber: "Petani", batas_stok_rendah: "10" });
    const kembali = komoditasDariApi({ ...baris, detail: isian.detail });
    expect(kembali.keunggulan).toEqual(k.keunggulan);
    expect(kembali.pengiriman).toEqual(k.pengiriman);
  });

  it("nilai kosong dikirim sebagai teks kosong (backend mengubahnya menjadi NULL)", () => {
    const isian = isianKeApi({ ...komoditasDariApi(baris), hargaCoret: undefined, batasStokRendah: undefined });
    expect(isian.harga_coret).toBe("");
    expect(isian.batas_stok_rendah).toBe("");
  });
});

describe("musim tersedia di kolom detail", () => {
  it("dibaca dari API dan dikirim kembali", () => {
    const k = komoditasDariApi({ ...baris, detail: JSON.stringify({ musim: { mulai: 5, selesai: 8 } }) });
    expect(k.musim).toEqual({ mulai: 5, selesai: 8 });
    const detail = JSON.parse(isianKeApi(k).detail);
    expect(detail.musim).toEqual({ mulai: 5, selesai: 8 });
  });
  it("produk lama tanpa musim tetap sepanjang tahun", () => {
    expect(komoditasDariApi(baris).musim).toBeUndefined();
  });
});

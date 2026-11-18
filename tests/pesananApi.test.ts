import { describe, expect, it } from "vitest";
import { inisialNama, perubahanKeApi, pesananDariApi, statusDariApi, statusKeApi, type BarisPesananApi } from "@/lib/pesananApi";

const baris: BarisPesananApi = {
  id: 5, kode: "PSD-20261024-0089", idPembayaran: null, pembeli: "Pak RT Joko Susanto", alamat: "Warga Krajan", rtRw: "RT 02 / RW 01", patokan: null,
  dropPoint: "Pos Drop-Point BUMDes Krajan RT 02", opsiPengiriman: "kurir-desa", metodeBayar: "QRIS", telepon: "6281234", catatan: null, status: "pending", total: "92000.00",
  tibaDiPosPada: null, kurir: JSON.stringify({ nama: "Mas Slamet", armada: "Motor", jadwal: "15:00 - 17:00 WIB" }), komplain: null, kirimUlang: 0, dibuatPada: "2026-10-24T07:15:00.000Z",
  items: [{ komoditas: "Beras Pandan Wangi", jumlah: "1.000", satuan: "sak", hargaSatuan: "68000.00", subtotal: "68000.00", tag: null }],
};

describe("pesananDariApi", () => {
  it("memetakan kolom, jam WIB, jumlah tanpa nol desimal, dan kurir JSON", () => {
    const p = pesananDariApi(baris);
    expect(p).toMatchObject({ id: "PSD-20261024-0089", inisial: "JS", status: "menunggu-pembayaran", waktu: "14:15 WIB", total: 92000, metodeBayar: "QRIS", opsiPengiriman: "kurir-desa" });
    expect(p.items[0]).toMatchObject({ jumlah: "1 sak", hargaSatuan: 68000, subtotal: 68000 });
    expect(p.kurir?.nama).toBe("Mas Slamet");
    expect(p.kirimUlang).toBeUndefined();
  });

  it("status lama backend disamakan dengan alur dashboard", () => {
    expect(statusDariApi("diproses")).toBe("perlu-dikemas");
    expect(statusDariApi("dikirim")).toBe("diantar");
    expect(statusDariApi("tidak-dikenal")).toBe("perlu-dikemas");
    expect(statusKeApi("menunggu-pembayaran")).toBe("pending");
    expect(statusKeApi("tiba-di-pos")).toBe("tiba-di-pos");
  });

  it("metode bayar tak dikenal dianggap QRIS; COD dikenali", () => {
    expect(pesananDariApi({ ...baris, metodeBayar: null }).metodeBayar).toBe("QRIS");
    expect(pesananDariApi({ ...baris, metodeBayar: "cod kasir" }).metodeBayar).toBe("COD");
  });
});

describe("inisialNama", () => {
  it("melewati sapaan; satu kata memakai dua huruf pertama", () => {
    expect(inisialNama("Bu Bungsu Sri")).toBe("BS");
    expect(inisialNama("Pak Haji Mansur")).toBe("MA");
    expect(inisialNama("Bu Lastri")).toBe("LA");
  });
});

describe("perubahanKeApi", () => {
  it("hanya bagian yang berubah lewat alur dashboard; kosong menjadi null", () => {
    const p = pesananDariApi(baris);
    expect(perubahanKeApi({ ...p, kurir: undefined })).toEqual({ status: "pending", kurir: null, komplain: null, tibaDiPosPada: null, kirimUlang: false });
  });
});

describe("pembatalan dan ulasan", () => {
  it("jejak pembatalan oleh pembeli ikut terbaca", () => {
    const p = pesananDariApi({ ...baris, status: "dibatalkan", dibatalkanOleh: "pembeli", alasanBatal: "Salah memilih produk", dibatalkanPada: "2026-10-24T08:00:00.000Z" });
    expect(p).toMatchObject({ status: "dibatalkan", dibatalkanOleh: "pembeli", alasanBatal: "Salah memilih produk" });
  });

  it("ulasan: rating angka, tag dari JSON teks, kosong → tidak ada ulasan", () => {
    const p = pesananDariApi({ ...baris, status: "selesai", ulasan: { rating: "5", tags: '["Segar","Tepat waktu"]', catatan: "Mantap", kurirDisukai: true, dibuatPada: "2026-10-25T01:00:00.000Z" } });
    expect(p.ulasan).toMatchObject({ rating: 5, tags: ["Segar", "Tepat waktu"], catatan: "Mantap", kurirDisukai: true });
    expect(pesananDariApi({ ...baris, ulasan: null }).ulasan).toBeUndefined();
  });
});

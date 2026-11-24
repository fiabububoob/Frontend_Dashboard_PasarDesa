import { describe, expect, it } from "vitest";
import { KOMODITAS_LIST } from "@/lib/data/komoditas";
import { adaError, dataDariDraft, draftDari, draftKosong, errorDraft } from "@/lib/komoditasForm";

const SEKARANG = new Date("2023-10-24T03:00:00Z"); // 24 Okt 2023 10:00 WIB

describe("draftKosong", () => {
  it("mengisi tanggal panen hari ini (WIB) dan kategori pertama", () => {
    const d = draftKosong(SEKARANG);
    expect(d.tanggalPanen).toBe("2023-10-24");
    expect(d.kategori).toBe("Beras & Gabah");
    expect(d.ikonDipilihSendiri).toBe(false);
  });
});

describe("draftDari → dataDariDraft", () => {
  it("round-trip: data produk tidak berubah", () => {
    const beras = KOMODITAS_LIST.find((k) => k.id === "SKR-PND-05")!;
    const data = dataDariDraft(draftDari(beras));
    expect(data.nama).toBe(beras.nama);
    expect(data.harga).toBe(beras.harga);
    expect(data.hargaCoret).toBe(beras.hargaCoret);
    expect(data.spesifikasi).toEqual(beras.spesifikasi);
    expect(data.badge).toEqual(beras.badge);
    expect(data.tanggalPanen).toBeUndefined(); // produk lama tanpa tanggal tetap tanpa tanggal
  });
});

describe("dataDariDraft", () => {
  const dasar = { ...draftKosong(SEKARANG), nama: "  Kacang  ", harga: "28000", stok: "20", stokMaks: "40", satuan: " kg ", asalBlok: " Blok A " };

  it("merapikan teks dan mengubah angka", () => {
    const data = dataDariDraft(dasar);
    expect(data).toMatchObject({ nama: "Kacang", satuan: "kg", asalBlok: "Blok A", harga: 28000, stok: 20, stokMaks: 40 });
  });
  it("teks kosong menjadi undefined", () => {
    const data = dataDariDraft({ ...dasar, deskripsi: "   ", ukuran: "", tag: "" });
    expect(data.deskripsi).toBeUndefined();
    expect(data.ukuran).toBeUndefined();
    expect(data.tag).toBeUndefined();
    expect(data.hargaCoret).toBeUndefined();
  });
  it("membuang baris spesifikasi yang belum lengkap", () => {
    const data = dataDariDraft({
      ...dasar,
      spesifikasi: [
        { label: " Berat ", nilai: " 5 kg " },
        { label: "Asal", nilai: "" },
        { label: "", nilai: "x" },
      ],
    });
    expect(data.spesifikasi).toEqual([{ label: "Berat", nilai: "5 kg" }]);
  });
});

describe("errorDraft", () => {
  const dasar = draftKosong(SEKARANG);
  it("tanpa masalah bila isian wajar", () => {
    expect(adaError(errorDraft({ ...dasar, harga: "10000", hargaCoret: "12000", stok: "5", stokMaks: "10" }))).toBe(false);
  });
  it("stok tidak boleh melebihi kapasitas", () => {
    expect(errorDraft({ ...dasar, stok: "11", stokMaks: "10" }).stok).toContain("kapasitas");
  });
  it("harga coret harus lebih besar dari harga jual", () => {
    expect(errorDraft({ ...dasar, harga: "10000", hargaCoret: "10000" }).hargaCoret).toContain("lebih besar");
    expect(errorDraft({ ...dasar, harga: "10000", hargaCoret: "" }).hargaCoret).toBeUndefined();
  });
});

describe("musim tersedia", () => {
  const dasar = () => ({ ...draftKosong(new Date("2023-10-23T03:00:00Z")), nama: "Durian", harga: "50000", stok: "10", stokMaks: "20", satuan: "kg", asalBlok: "A" });

  it("kosong = sepanjang tahun, tanpa error", () => {
    const d = dasar();
    expect(errorDraft(d).musim).toBeUndefined();
    expect(dataDariDraft(d).musim).toBeUndefined();
  });
  it("harus diisi kedua-duanya atau kosong keduanya", () => {
    expect(errorDraft({ ...dasar(), musimMulai: "5" }).musim).toBeDefined();
    expect(errorDraft({ ...dasar(), musimSelesai: "8" }).musim).toBeDefined();
    expect(adaError(errorDraft({ ...dasar(), musimMulai: "5" }))).toBe(true);
  });
  it("diubah ke angka bulan saat disimpan, dan kembali ke isian saat diedit", () => {
    const data = dataDariDraft({ ...dasar(), musimMulai: "11", musimSelesai: "2" });
    expect(data.musim).toEqual({ mulai: 11, selesai: 2 });
    const k = { ...KOMODITAS_LIST[0], musim: { mulai: 5, selesai: 8 } };
    const d = draftDari(k);
    expect(d.musimMulai).toBe("5");
    expect(d.musimSelesai).toBe("8");
  });
  it("lokasi ambil tidak lagi menjadi isian form", () => {
    expect("lokasiAmbil" in dasar()).toBe(false);
    expect(dataDariDraft(dasar()).pengiriman).not.toHaveProperty("lokasiAmbil");
  });
});

describe("batas klaim", () => {
  const dasar = () => ({ ...draftKosong(new Date("2023-10-23T03:00:00Z")), nama: "Durian", harga: "50000", stok: "10", stokMaks: "20", satuan: "kg", asalBlok: "A" });

  it("tidak lagi dipilih per produk: selalu 2×24 jam bila bisa diklaim", () => {
    expect("batasKlaim" in dasar()).toBe(false);
    expect(dataDariDraft({ ...dasar(), bisaDiklaim: true }).pengiriman?.batasKlaim).toBe("2×24 jam");
  });
  it("tidak ada batas bila produk tidak bisa diklaim", () => {
    expect(dataDariDraft({ ...dasar(), bisaDiklaim: false }).pengiriman?.batasKlaim).toBeUndefined();
  });
});

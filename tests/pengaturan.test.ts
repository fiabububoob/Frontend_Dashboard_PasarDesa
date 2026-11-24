import { describe, expect, it } from "vitest";
import { JADWAL_AWAL, TUTUP_AWAL } from "@/lib/data/pengaturan";
import { cekJadwal, jadwalHariIni, kategoriDitutup, pesanTutup, rapikanKategoriTutup, statusLapak, tutupBerlaku } from "@/lib/pengaturan";
import type { JadwalOperasional, TutupSementara } from "@/types";

const SENIN_10_WIB = new Date("2023-10-23T03:00:00Z");
const SENIN_05_WIB = new Date("2023-10-22T22:00:00Z");
const SENIN_19_WIB = new Date("2023-10-23T12:00:00Z");
const JADWAL = { jadwal: JADWAL_AWAL };

describe("cekJadwal", () => {
  it("jadwal awal valid", () => {
    expect(cekJadwal(JADWAL_AWAL)).toEqual({});
  });
  it("menolak jam tutup sebelum jam buka", () => {
    const salah: JadwalOperasional[] = [{ ...JADWAL_AWAL[0], buka: "10:00", tutup: "09:00" }];
    expect(cekJadwal(salah)[0]).toContain("Jam tutup");
  });
  it("menolak cut-off di luar jam operasional", () => {
    const salah: JadwalOperasional[] = [{ ...JADWAL_AWAL[0], cutOff: "20:00" }];
    expect(cekJadwal(salah)[0]).toContain("Batas order");
  });
  it("tidak memvalidasi hari yang tutup", () => {
    const tutup: JadwalOperasional[] = [{ ...JADWAL_AWAL[0], status: "tutup", buka: "", tutup: "", cutOff: "" }];
    expect(cekJadwal(tutup)).toEqual({});
  });
});

describe("jadwalHariIni", () => {
  it("Senin memakai baris pertama, Minggu baris terakhir", () => {
    expect(jadwalHariIni(JADWAL_AWAL, SENIN_10_WIB)?.hari).toBe("Senin");
    expect(jadwalHariIni(JADWAL_AWAL, new Date("2023-10-29T03:00:00Z"))?.hari).toBe("Minggu");
  });
});

describe("statusLapak", () => {
  it("buka di dalam jam operasional", () => {
    const s = statusLapak(JADWAL, TUTUP_AWAL, SENIN_10_WIB);
    expect(s.kode).toBe("buka");
    expect(s.buka).toBe(true);
  });
  it("belum buka sebelum jam buka", () => {
    expect(statusLapak(JADWAL, TUTUP_AWAL, SENIN_05_WIB).kode).toBe("belum-buka");
  });
  it("sudah tutup setelah jam tutup", () => {
    expect(statusLapak(JADWAL, TUTUP_AWAL, SENIN_19_WIB).kode).toBe("sudah-tutup");
  });
  it("tutup sementara seluruh toko menutup lapak kapan pun", () => {
    const s = statusLapak(JADWAL, { ...TUTUP_AWAL, aktif: true }, SENIN_10_WIB);
    expect(s.kode).toBe("jeda");
    expect(s.buka).toBe(false);
    expect(s.keterangan).toBe("Tutup sementara");
  });
  it("hari berstatus tutup → libur", () => {
    const libur = { jadwal: JADWAL_AWAL.map((j) => ({ ...j, status: "tutup" as const })) };
    expect(statusLapak(libur, TUTUP_AWAL, SENIN_10_WIB).kode).toBe("libur");
  });
});

describe("tutup sementara", () => {
  const aktif: TutupSementara = { aktif: true, kategori: [], sampai: "", pesan: "" };

  it("pesan admin dipakai sebagai keterangan untuk warga", () => {
    const s = statusLapak(JADWAL, { ...aktif, pesan: "Panen padi jeda sampai 5 Desember" }, SENIN_10_WIB);
    expect(s.keterangan).toBe("Panen padi jeda sampai 5 Desember");
  });

  it("tanpa pesan, keterangan dibuat dari tanggal buka kembali", () => {
    expect(pesanTutup({ ...aktif, sampai: "2023-12-05" })).toBe("Tutup hingga 5 Desember 2023");
  });

  it("berlaku sampai akhir tanggal 'sampai' (WIB), lalu buka otomatis", () => {
    expect(tutupBerlaku({ ...aktif, sampai: "2023-10-23" }, SENIN_10_WIB)).toBe(true); // hari terakhir masih tutup
    expect(tutupBerlaku({ ...aktif, sampai: "2023-10-22" }, SENIN_10_WIB)).toBe(false);
    expect(statusLapak(JADWAL, { ...aktif, sampai: "2023-10-22" }, SENIN_10_WIB).kode).toBe("buka");
  });

  it("tanpa tanggal, tutup sampai dibuka manual", () => {
    expect(tutupBerlaku(aktif, new Date("2030-01-01T00:00:00Z"))).toBe(true);
  });

  it("yang tidak aktif tidak pernah berlaku", () => {
    expect(tutupBerlaku({ ...aktif, aktif: false }, SENIN_10_WIB)).toBe(false);
  });

  it("per kategori: lapak tetap mengikuti jadwal, hanya kategori itu yang ditutup", () => {
    const s = statusLapak(JADWAL, { ...aktif, kategori: ["hasil-tani"] }, SENIN_10_WIB);
    expect(s.kode).toBe("buka");
    expect(s.kategoriTutup).toEqual(["hasil-tani"]);
    expect(kategoriDitutup(s, "hasil-tani")).toBe(true);
    expect(kategoriDitutup(s, "sembako")).toBe(false);
  });

  it("tutup seluruh toko menutup semua kategori", () => {
    const s = statusLapak(JADWAL, aktif, SENIN_10_WIB);
    expect(kategoriDitutup(s, "sembako")).toBe(true);
  });

  it("penutupan per kategori yang sudah lewat tanggalnya tidak lagi menandai kategori", () => {
    const s = statusLapak(JADWAL, { ...aktif, kategori: ["hasil-tani"], sampai: "2023-10-22" }, SENIN_10_WIB);
    expect(s.kategoriTutup).toEqual([]);
  });
});

describe("rapikanKategoriTutup", () => {
  it("memilih semua kategori = tutup seluruh toko", () => {
    expect(rapikanKategoriTutup(["a", "b", "c", "d"], 4)).toEqual([]);
  });
  it("sebagian kategori dibiarkan apa adanya", () => {
    expect(rapikanKategoriTutup(["a", "b"], 4)).toEqual(["a", "b"]);
  });
});

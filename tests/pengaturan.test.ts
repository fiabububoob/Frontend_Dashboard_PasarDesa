import { describe, expect, it } from "vitest";
import { JADWAL_AWAL } from "@/lib/data/pengaturan";
import { cekJadwal, jadwalHariIni, statusLapak } from "@/lib/pengaturan";
import type { JadwalOperasional } from "@/types";

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
    const s = statusLapak(JADWAL, false, SENIN_10_WIB);
    expect(s.kode).toBe("buka");
    expect(s.buka).toBe(true);
  });
  it("belum buka sebelum jam buka", () => {
    expect(statusLapak(JADWAL, false, SENIN_05_WIB).kode).toBe("belum-buka");
  });
  it("sudah tutup setelah jam tutup", () => {
    expect(statusLapak(JADWAL, false, SENIN_19_WIB).kode).toBe("sudah-tutup");
  });
  it("mode jeda tanam menutup lapak kapan pun", () => {
    expect(statusLapak(JADWAL, true, SENIN_10_WIB).kode).toBe("jeda");
  });
  it("hari berstatus tutup → libur", () => {
    const libur = { jadwal: JADWAL_AWAL.map((j) => ({ ...j, status: "tutup" as const })) };
    expect(statusLapak(libur, false, SENIN_10_WIB).kode).toBe("libur");
  });
});

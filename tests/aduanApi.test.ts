import { describe, expect, it } from "vitest";
import { aduanDariApi, lewatBatas, type BarisAduanApi } from "@/lib/aduanApi";
import { daftarFoto, urlFoto } from "@/lib/fotoUrl";

const baris: BarisAduanApi = {
  id: 7, kode: "ADU-20261024-0021", topik: "Pengantaran / Kurir Desa", kodePesanan: "PSD-20261024-0089", judul: "Kurir terlambat", deskripsi: "Menunggu 2 jam",
  foto: '["http://10.0.2.2:3000/uploads/evidence/a.jpg","/uploads/evidence/b.png"]', solusiDiminta: "Koordinasi Langsung via WhatsApp Petugas", status: "diverifikasi",
  balasan: null, dibalasPada: null, dibuatPada: "2026-10-24T07:00:00.000Z", pembeli: "Bu Lastri", email: "l@x.id", telepon: "62812",
};

describe("fotoUrl", () => {
  it("host pembuat dibuang: hanya /uploads/... yang dipakai", () => {
    expect(urlFoto("http://10.0.2.2:3000/uploads/evidence/a.jpg?v=1")).toBe("/uploads/evidence/a.jpg");
    expect(urlFoto("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
    expect(urlFoto(null)).toBe("");
  });
  it("daftarFoto menerima JSON teks maupun array dan membuang yang kosong", () => {
    expect(daftarFoto('["/uploads/evidence/a.jpg"]')).toEqual(["/uploads/evidence/a.jpg"]);
    expect(daftarFoto("rusak")).toEqual([]);
    expect(daftarFoto(null)).toEqual([]);
  });
});

describe("aduanDariApi", () => {
  it("memetakan kolom dan menormalkan foto", () => {
    const a = aduanDariApi(baris);
    expect(a).toMatchObject({ idServer: 7, id: "ADU-20261024-0021", topik: "Pengantaran / Kurir Desa", kodePesanan: "PSD-20261024-0089", status: "diverifikasi", pembeli: "Bu Lastri" });
    expect(a.foto).toEqual(["/uploads/evidence/a.jpg", "/uploads/evidence/b.png"]);
    expect(a.balasan).toBeUndefined();
  });
});

describe("lewatBatas (target tindak lanjut 1×24 jam)", () => {
  const a = aduanDariApi(baris);
  it("belum selesai dan lewat 24 jam → terlambat", () => {
    expect(lewatBatas(a, new Date("2026-10-25T08:00:00.000Z"))).toBe(true);
    expect(lewatBatas(a, new Date("2026-10-25T06:00:00.000Z"))).toBe(false);
  });
  it("yang sudah selesai tidak pernah terlambat", () => {
    expect(lewatBatas({ ...a, status: "selesai" }, new Date("2027-01-01T00:00:00.000Z"))).toBe(false);
  });
});

"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { tambahKomoditas } from "@/lib/server/komoditas";

export async function aksiTambahKomoditas(_prev: { error: string | null }, formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const satuan = String(formData.get("satuan") ?? "").trim();
  const harga = Number(formData.get("harga"));
  if (!nama || !satuan || Number.isNaN(harga)) return { error: "Nama, harga, dan satuan wajib diisi." };

  try {
    await tambahKomoditas({
      nama, satuan, harga,
      stok: Number(formData.get("stok")) || 0,
      stokMaks: Number(formData.get("stokMaks")) || 0,
      kategori: String(formData.get("kategori") ?? ""),
      gambar: String(formData.get("gambar") ?? "🌾"),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menyimpan." };
  }
  revalidatePath("/komoditas"); // segarkan daftar
  redirect("/komoditas");       // HARUS di luar try/catch
}
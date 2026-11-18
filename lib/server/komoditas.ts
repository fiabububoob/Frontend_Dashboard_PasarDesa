import "server-only";
import type { Komoditas } from "@/types";

const API = process.env.API_URL ?? "http://localhost:4000/api";

// Daftar komoditas — strategi ISR (cache 60 detik).
export async function getDaftarKomoditas(): Promise<Komoditas[]> {
  const res = await fetch(`${API}/komoditas`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Gagal memuat komoditas");
  return (await res.json()).data;
}

// Detail satu komoditas — null bila tidak ada (untuk notFound()).
export async function getKomoditas(id: string): Promise<Komoditas | null> {
  const res = await fetch(`${API}/komoditas/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Gagal memuat komoditas");
  return (await res.json()).data;
}

export async function tambahKomoditas(data: Record<string, unknown>) {
  const res = await fetch(`${API}/komoditas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Gagal menyimpan");
  return (await res.json()).data;
}
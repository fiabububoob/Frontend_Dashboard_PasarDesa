import { NextResponse, type NextRequest } from "next/server";
import { NAMA_COOKIE_SESI } from "@/lib/server/session";

// Dituju layout dashboard saat token tidak valid/kedaluwarsa. Hanya route handler yang boleh mengubah
// cookie saat merespons GET (Server Component tidak boleh), jadi cookie rusak dihapus di sini
// lalu user dikirim ke /login.
export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete(NAMA_COOKIE_SESI);
  return res;
}

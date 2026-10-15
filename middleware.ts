import { NextResponse, type NextRequest } from "next/server";

const HALAMAN_AUTH = ["/login", "/register", "/lupa-password"];
const NAMA_COOKIE_SESI = "pasardesa_token"; // harus sama dengan lib/server/session.ts

// Gerbang pertama, hanya memeriksa KEBERADAAN cookie (keabsahan token dinilai layout dashboard):
//   • belum punya cookie  + membuka halaman dashboard → ke /login
//   • sudah punya cookie  + membuka login/register    → ke /
// Cookie yang ternyata kedaluwarsa/tidak valid dibereskan layout dashboard dengan mengirim user ke
// /sesi-berakhir, yang MENGHAPUS cookie itu lalu ke /login. Karena cookie dihapus, rantai redirect
// selalu berhenti di /login dan tidak mungkin berputar.
export function middleware(req: NextRequest) {
  const adaSesi = req.cookies.has(NAMA_COOKIE_SESI);
  const halamanAuth = HALAMAN_AUTH.some((path) => req.nextUrl.pathname.startsWith(path));

  if (!adaSesi && !halamanAuth) return NextResponse.redirect(new URL("/login", req.url));
  if (adaSesi && halamanAuth) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  // Lewati aset statis (_next, favicon, dan file berekstensi seperti .png/.svg).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

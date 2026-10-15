// Akun admin yang sedang login (bentuk response GET /api/auth/me).
export interface Pengguna {
  id: string;
  nama: string;
  email: string;
  jabatan: string;
  foto?: string;
  role: "admin" | "user";
}

// State yang dikembalikan Server Action form autentikasi (dipakai useActionState).
export interface AuthState {
  /** Pesan error per field, kuncinya sama dengan atribut `name` input. */
  errors?: Record<string, string>;
  /** Pesan umum (mis. "Email atau kata sandi salah."). */
  message?: string;
  /** Isian yang dikembalikan supaya tidak hilang saat validasi gagal (password tidak pernah dikembalikan). */
  values?: Record<string, string>;
}

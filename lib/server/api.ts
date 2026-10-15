import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions extends RequestInit {
  /** JWT admin; dikirim sebagai header `Authorization: Bearer`. */
  token?: string;
}

// Satu-satunya pintu keluar ke Express API. fetch() TIDAK melempar error untuk status 4xx/5xx,
// jadi res.ok dicek di sini; pemanggil cukup menangkap ApiError.
// Backend selalu membalas { success, data, message? } → fungsi ini mengembalikan `data`.
export async function apiFetch<T>(path: string, { token, headers, ...init }: ApiFetchOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(503, "Server tidak dapat dihubungi. Coba lagi beberapa saat.");
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.message ?? "Terjadi kesalahan pada server.");
  return body.data as T;
}

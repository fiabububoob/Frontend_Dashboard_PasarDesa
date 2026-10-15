"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import { AlertCircle, KeyRound, UserPlus } from "lucide-react";
import { aksiRegister } from "@/app/(auth)/actions";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/formStyles";
import { DAFTAR_PERAN, PERAN_BAWAAN } from "@/lib/peran";
import type { AuthState } from "@/types";
import { ChevronDown, IdCard, Lock, Mail, Phone, UserRound } from "lucide-react";

const STATE_AWAL: AuthState = {};

// useFormStatus hanya bisa dibaca dari komponen DI DALAM <form>, jadi tombol dipisah.
function TombolDaftar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" status={pending ? "loading" : "idle"} loadingLabel="Mendaftarkan…" className="w-full">
      <UserPlus className="h-4 w-4" />
      Daftar Akun Admin Sekarang
    </Button>
  );
}

// Form register: Server Action (aksiRegister) memvalidasi & memanggil Express; komponen ini hanya menampilkan hasilnya.
export function RegisterForm() {
  const [state, formAction] = useActionState(aksiRegister, STATE_AWAL);
  const errors = state.errors;
  const values = state.values;

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.message && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-50 p-3 text-sm font-medium text-danger-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField
          label="Nama Lengkap Admin"
          name="nama"
          required
          placeholder="Budi Santoso, S.P."
          autoComplete="name"
          defaultValue={values?.nama}
          error={errors?.nama}
        />
        <AuthField label="NIP / ID Pengelola BUMDes" name="nip" required placeholder="ADM-3507-001" defaultValue={values?.nip} error={errors?.nip} />
      </div>

      <div>
        <label htmlFor="peran" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-700">
          Peran / Jabatan Akun <span className="text-danger-600">*</span>
        </label>
        <div className="relative">
        <select
            id="peran"
            name="peran"
            required
            defaultValue={values?.peran ?? PERAN_BAWAAN}
            aria-invalid={errors?.peran ? true : undefined}
            aria-describedby={errors?.peran ? "peran-pesan" : undefined}
            className={clsx(fieldClass(), "appearance-none pr-10", errors?.peran && "!border-danger-600 focus:!border-danger-600 focus:!ring-danger-600")}
        >
            {DAFTAR_PERAN.map((peran) => (
            <option key={peran} value={peran}>
                {peran}
            </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
        </div>
        {errors?.peran && (
          <p id="peran-pesan" role="alert" className="mt-1 text-xs font-medium text-danger-600">
            {errors.peran}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField
          label="Email Dinas / Resmi"
          name="email"
          type="email"
          required
          placeholder="admin.budi@sukorejo.id"
          autoComplete="email"
          defaultValue={values?.email}
          error={errors?.email}
        />
        <AuthField
          label="Nomor Telepon (WhatsApp)"
          name="telepon"
          type="tel"
          required
          prefixText="+62"
          placeholder="8xx xxx xxx"
          autoComplete="tel-national"
          defaultValue={values?.telepon}
          error={errors?.telepon}
        />
      </div>

      <AuthField
        label="Kode Otorisasi BUMDes"
        name="kodeOtorisasi"
        icon={KeyRound}
        required
        highlight
        autoComplete="off"
        defaultValue={values?.kodeOtorisasi}
        error={errors?.kodeOtorisasi}
        hint="Kode rahasia yang diberikan oleh Kepala BUMDes Sukorejo."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField
          label="Password"
          name="password"
          togglePassword
          required
          minLength={8}
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          error={errors?.password}
        />
        <AuthField
          label="Konfirmasi Password"
          name="konfirmasiPassword"
          togglePassword
          required
          minLength={8}
          placeholder="Ulangi kata sandi"
          autoComplete="new-password"
          error={errors?.konfirmasiPassword}
        />
      </div>

      <div>
        <label className="flex items-start gap-2.5 pt-1 text-sm text-ink-700">
          <input
            type="checkbox"
            name="pakta"
            required
            defaultChecked={values?.pakta === "on"}
            aria-invalid={errors?.pakta ? true : undefined}
            aria-describedby={errors?.pakta ? "pakta-pesan" : undefined}
            className={clsx("mt-0.5 h-4 w-4 rounded text-brand-600 focus:ring-brand-500", errors?.pakta ? "border-danger-600" : "border-line")}
          />
          <span>
            Saya menyetujui <span className="font-semibold text-brand-700">Pakta Integritas Administrator</span> serta kerahasiaan data keuangan BUMDes.
          </span>
        </label>
        {errors?.pakta && (
          <p id="pakta-pesan" role="alert" className="mt-1 text-xs font-medium text-danger-600">
            {errors.pakta}
          </p>
        )}
      </div>

      <TombolDaftar />
    </form>
  );
}
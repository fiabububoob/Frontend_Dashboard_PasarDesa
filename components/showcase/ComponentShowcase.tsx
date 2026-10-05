"use client";

import { Loader2, Save } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useActionStatus } from "@/lib/hooks/useActionStatus";
import { simulateRequest } from "@/lib/fake-api";
import { DURATION } from "@/lib/motion";

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      <p className="mt-0.5 text-xs text-ink-500">{hint}</p>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function StateCell({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <p className="text-xs font-semibold uppercase text-ink-400">{label}</p>
      <div className="mt-2">{children}</div>
      {note && <p className="mt-2 text-[11px] text-ink-400">{note}</p>}
    </div>
  );
}

// Kurva CSS bawaan untuk demo easing (sama seperti slide "Easing: mengatur rasa gerakan").
const CURVES = [
  { name: "Linear", css: "linear", hint: "Konstan; terasa mekanis" },
  { name: "Ease-in", css: "cubic-bezier(0.4, 0, 1, 1)", hint: "Lambat → cepat; untuk KELUAR" },
  { name: "Ease-out", css: "cubic-bezier(0, 0, 0.2, 1)", hint: "Cepat → lambat; untuk MASUK" },
  { name: "Ease-in-out", css: "cubic-bezier(0.4, 0, 0.2, 1)", hint: "Untuk PERPINDAHAN" },
];

function EasingDemo() {
  const [moved, setMoved] = useState(false);
  return (
    <div>
      <div className="space-y-3">
        {CURVES.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            <div className="w-28 shrink-0">
              <p className="text-xs font-medium text-ink-900">{c.name}</p>
              <p className="text-[11px] text-ink-400">{c.hint}</p>
            </div>
            <div className="relative h-8 flex-1 rounded-full bg-surface-sunken">
              <span
                className="absolute top-1 h-6 w-6 rounded-full bg-brand-600"
                style={{
                  left: moved ? "calc(100% - 1.75rem)" : "0.25rem",
                  transition: `left ${DURATION.move * 3}ms ${c.css}`, // diperlambat 3x agar perbedaan kurva terlihat
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <Button variant="secondary" className="mt-4" onClick={() => setMoved((m) => !m)}>
        Putar Demo (diperlambat 3×)
      </Button>
    </div>
  );
}

export function ComponentShowcase() {
  const confirm = useConfirm();
  const toast = useToast();
  const success = useActionStatus();
  const failure = useActionStatus();

  return (
    <div className="space-y-6">
      <Section
        title="Button — 6 state"
        hint="Default, hover, pressed, loading, success/error, dan disabled. Hover & pressed bisa dicoba langsung."
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StateCell label="Default">
            <Button>Simpan</Button>
          </StateCell>
          <StateCell label="Hover / Pressed" note="Arahkan kursor, lalu tahan klik (100ms).">
            <Button>Simpan</Button>
          </StateCell>
          <StateCell label="Loading">
            <Button status="loading" loadingLabel="Menyimpan…">
              Simpan
            </Button>
          </StateCell>
          <StateCell label="Success">
            <Button status="success" successLabel="Tersimpan">
              Simpan
            </Button>
          </StateCell>
          <StateCell label="Error">
            <Button status="error">Simpan</Button>
          </StateCell>
          <StateCell label="Disabled">
            <Button disabled>Simpan</Button>
          </StateCell>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button status={success.status} onClick={() => success.run(() => simulateRequest(1200))} loadingLabel="Menyimpan…" successLabel="Tersimpan">
            <Save className="h-4 w-4" />
            Coba alur berhasil
          </Button>
          <Button
            variant="secondary"
            status={failure.status}
            onClick={() => failure.run(() => simulateRequest(1200, { fail: true }))}
            loadingLabel="Menyimpan…"
          >
            Coba alur gagal
          </Button>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section title="Input — state" hint="Default, focus, error (getar singkat + pesan), success, dan disabled.">
          <div className="space-y-3">
            <Input placeholder="Default" />
            <Input placeholder="Klik untuk melihat state focus" />
            <Input defaultValue="ab" error="Minimal 3 karakter" />
            <Input defaultValue="Poktan Krajan Makmur" success />
            <Input defaultValue="Tidak bisa diubah" disabled />
          </div>
        </Section>

        <Section title="Toggle & Loader" hint="Toggle bergeser 100ms (feedback sederhana). Spinner untuk state loading.">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Toggle aria-label="Contoh toggle nonaktif" />
              Off
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Toggle aria-label="Contoh toggle aktif" defaultChecked />
              On
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Toggle aria-label="Contoh toggle disabled" disabled />
              Disabled
            </div>
            <div className="flex items-center gap-3 text-brand-600">
              <Loader2 className="h-4 w-4 animate-spin" aria-label="Memuat" />
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => toast({ type: "success", title: "Tersimpan", description: "Contoh toast sukses." })}>
              Toast sukses
            </Button>
            <Button variant="secondary" onClick={() => toast({ type: "error", title: "Gagal menyimpan", description: "Contoh toast error." })}>
              Toast error
            </Button>
            <Button variant="secondary" onClick={() => toast({ type: "info", title: "Katalog ditutup sementara" })}>
              Toast info
            </Button>
          </div>
        </Section>
      </div>

      <Section
        title="Overlay + Obscuration"
        hint="Dialog konfirmasi muncul di atas halaman dengan latar diburamkan. Masuk ease-out 225ms, keluar ease-in 195ms. Esc / klik latar = batal."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              const ok = await confirm({ title: "Yakin ingin menyimpan perubahan?", description: "Perubahan akan langsung tampil di aplikasi warga." });
              toast({ type: ok ? "success" : "info", title: ok ? "Dikonfirmasi" : "Dibatalkan" });
            }}
          >
            Dialog konfirmasi
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await confirm({
                title: "Batalkan semua perubahan?",
                description: "Perubahan yang belum disimpan akan hilang.",
                confirmLabel: "Ya, Batalkan",
                cancelLabel: "Lanjut Mengedit",
                tone: "danger",
              });
              toast({ type: ok ? "success" : "info", title: ok ? "Perubahan dibatalkan" : "Lanjut mengedit" });
            }}
          >
            Dialog berbahaya
          </Button>
        </div>
      </Section>

      <Section title="Easing" hint="Posisi awal & akhir sama, tapi 'rasa' geraknya berbeda tergantung kurva.">
        <EasingDemo />
      </Section>

      <Section title="Token timing" hint="Sumber: lib/motion.ts. Ubah di sana, semua komponen ikut berubah.">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["feedback", `${DURATION.feedback} ms`, "toggle, pressed"],
            ["enter", `${DURATION.enter} ms`, "ease-out · elemen masuk"],
            ["exit", `${DURATION.exit} ms`, "ease-in · elemen keluar"],
            ["move", `${DURATION.move} ms`, "ease-in-out · perpindahan"],
          ].map(([name, value, use]) => (
            <div key={name} className="rounded-lg bg-surface-muted p-3">
              <dt className="text-xs font-semibold uppercase text-ink-400">{name}</dt>
              <dd className="mt-1 font-semibold text-ink-900">{value}</dd>
              <dd className="text-[11px] text-ink-500">{use}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}

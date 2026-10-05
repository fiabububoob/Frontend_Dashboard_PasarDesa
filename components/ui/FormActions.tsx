import { Button, type ActionStatus } from "./Button";

interface FormActionsProps {
  onCancel: () => void;
  submitLabel: string;
  status: ActionStatus;
  cancelLabel?: string;
  submitDisabled?: boolean;
}

// Baris tombol di dasar form modal: Batal + kirim (dengan state loading/sukses/gagal).
export function FormActions({ onCancel, submitLabel, status, cancelLabel = "Batal", submitDisabled }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="submit" status={status} disabled={submitDisabled} loadingLabel="Menyimpan…" successLabel="Tersimpan" errorLabel="Coba lagi">
        {submitLabel}
      </Button>
    </div>
  );
}

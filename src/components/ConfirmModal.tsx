import { useEffect } from "react";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "confirm",
  cancelLabel = "cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "color-mix(in oklab, var(--fg) 35%, transparent)" }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--bg)] border border-[var(--fg)] p-6 fade-in"
        style={{ opacity: 1, transform: "none" }}
      >
        <div className="section-num mb-2">prompt</div>
        <h2 className="serif text-2xl lowercase mb-3">{title}</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="btn-ghost active">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

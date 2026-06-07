import { useEffect, useState } from "react";
import { getDailyQuote } from "@/lib/quotes";
import { STORAGE_KEYS } from "@/lib/storage";

export function DailyMail() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [data, setData] = useState<{ quote: string; key: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const d = getDailyQuote();
    setData(d);
    try {
      const last = localStorage.getItem(STORAGE_KEYS.dailyMailOpened);
      setUnread(last !== d.key);
    } catch {
      setUnread(true);
    }
  }, []);

  const openMail = () => {
    setOpen(true);
    if (data) {
      try {
        localStorage.setItem(STORAGE_KEYS.dailyMailOpened, data.key);
      } catch {}
      setUnread(false);
    }
  };

  return (
    <>
      <button
        onClick={openMail}
        title={unread ? "a letter arrived" : "today's letter"}
        className="relative mono text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 px-[8px] py-[2px] border"
      >
        mail
        {unread && (
          <span
            className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
        )}
      </button>

      {open && data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur-sm fade-in"
          style={{ opacity: 1, transform: "none" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-lg w-[90%] border border-[var(--line)] bg-[var(--bg)] p-8 md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between mb-6">
              <div className="mono text-[10px] tracking-widest text-[var(--faint)] uppercase">
                letter · {data.key}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="mono text-xs text-[var(--muted)] hover:text-[var(--fg)]"
              >
                close
              </button>
            </div>
            <div className="serif italic text-2xl md:text-3xl lowercase leading-snug text-[var(--fg)]">
              "{data.quote}"
            </div>
            <div className="mt-6 mono text-[10px] tracking-widest text-[var(--faint)] uppercase">
              — a note for today
            </div>
          </div>
        </div>
      )}
    </>
  );
}

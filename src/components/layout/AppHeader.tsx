import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage";

export function AppHeader({
  done,
  total,
  pct,
  onStartTour,
}: {
  done: number;
  total: number;
  pct: number;
  onStartTour: () => void;
}) {
  const [dark, setDark] = useState(false);
  const [version, setVersion] = useState("loading...");

  // hydrate theme from localStorage (fall back to system preference)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    const prefersDark =
      stored == null && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = stored ? stored === "dark" : !!prefersDark;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("https://api.github.com/repos/kayspace/gate-ae-prep/releases/latest")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((data) => {
        if (!cancelled) setVersion(data.tag_name || "dev");
      })
      .catch(() => {
        if (!cancelled) setVersion("dev");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const themeswitch = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, next ? "dark" : "light");
    } catch {}
  };

  return (
    <>
      <header className="px-6 md:px-10 pt-8 pb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="serif text-2xl">gate ae</span>
          <span className="tag">prep log · {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center mono text-xs text-[var(--muted)] gap-5">
          <div className="mono text-xs text-[var(--muted)]">
            {done}/{total} topics
          </div>
          <button
            data-tour="tour-btn"
            onClick={onStartTour}
            className="mono text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 cursor-pointer px-[8px] py-[2px] border"
            title="replay the tour"
          >
            tour
          </button>
          <button
            data-tour="theme"
            onClick={themeswitch}
            className="mono text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 cursor-pointer px-[8px] py-[2px] border"
          >
            {dark ? "light" : "dark"}
          </button>
          <span className="px-[8px] py-[2px] border">{version}</span>
        </div>
      </header>
      <div className="px-6 md:px-10" data-tour="progress">
        <div className="bar">
          <i style={{ transform: `scaleX(${pct})` }} />
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";

export function AppHeader({ done, total, pct }: { done: number; total: number; pct: number }) {
  const [dark, setDark] = useState(false);
  const [version, setVersion] = useState("loading...");

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
            onClick={themeswitch}
            className="mono text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 cursor-pointer px-[8px] py-[2px] border"
          >
            {dark ? "light" : "dark"}
          </button>
          <span className="px-[8px] py-[2px] border">{version}</span>
        </div>
      </header>
      <div className="px-6 md:px-10">
        <div className="bar">
          <i style={{ transform: `scaleX(${pct})` }} />
        </div>
      </div>
    </>
  );
}

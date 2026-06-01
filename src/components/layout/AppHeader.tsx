export function AppHeader({ done, total, pct }: { done: number; total: number; pct: number }) {
  return (
    <>
      <header className="px-6 md:px-10 pt-8 pb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="serif text-2xl">gate ae</span>
          <span className="tag">prep log · {new Date().getFullYear()}</span>
        </div>
        <div className="mono text-xs text-[var(--muted)]">
          {done}/{total} topics
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

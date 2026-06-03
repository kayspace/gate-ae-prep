export function BackToTop() {
  const scroll = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button
      onClick={scroll}
      aria-label="back to top"
      title="back to top"
      className="fixed bottom-6 right-6 z-50 mono text-[10px] uppercase tracking-widest border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--fg)] transition-colors px-3 py-2"
    >
      ↑ top
    </button>
  );
}

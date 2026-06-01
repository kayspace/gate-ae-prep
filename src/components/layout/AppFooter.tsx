export function AppFooter() {
  return (
    <footer className="px-6 md:px-10 py-10 mt-20 border-t border-[var(--line)] flex flex-wrap gap-4 justify-between items-baseline">
      <span className="mono text-[10px] text-[var(--faint)] tracking-widest">
        local-first · saves to your browser
      </span>
      <span className="serif italic text-sm text-[var(--muted)]">keep at it.</span>
      <span className="mono text-[10px] text-[var(--faint)] tracking-widest">
        by{" "}
        <a
          href="https://kayspace.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="link-u text-[var(--muted)] hover:text-[var(--fg)]"
        >
          kayspace
        </a>
      </span>
    </footer>
  );
}

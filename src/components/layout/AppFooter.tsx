export function AppFooter() {
  return (
    <footer className="px-6 md:px-10 py-4 mt-20 border-t border-[var(--line)] flex flex-wrap gap-4 justify-between items-center">
      <span className="serif italic text-sm text-[var(--muted)]">
        giving up is not an option. keep at it.
      </span>
      <span className="mono text-[10px] text-[var(--faint)] tracking-widest">
        support by a star on{" "}
        <a
          href="https://github.com/kayspace/gate-ae-prep"
          target="_blank"
          rel="noreferrer"
          className="link-u text-[var(--muted)] hover:text-[var(--fg)]"
        >
          github
        </a>
      </span>
      <span className="mono text-[10px] text-[var(--faint)] tracking-widest">
        open{" "}
        <a
          href="https://github.com/kayspace/gate-ae-prep/issues"
          target="_blank"
          rel="noreferrer"
          className="link-u text-[var(--muted)] hover:text-[var(--fg)]"
        >
          issues
        </a>{" "}
        /{" "}
        <a
          href="https://github.com/kayspace/gate-ae-prep/discussions"
          target="_blank"
          rel="noreferrer"
          className="link-u text-[var(--muted)] hover:text-[var(--fg)]"
        >
          discussions
        </a>
      </span>
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

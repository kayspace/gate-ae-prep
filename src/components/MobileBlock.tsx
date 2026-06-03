import { useEffect, useState } from "react";

// minimum supported viewport width (px). below this, we lock the app.
const MIN_WIDTH = 1024;

export function MobileBlock() {
  const [tooSmall, setTooSmall] = useState(false);

  useEffect(() => {
    const check = () => setTooSmall(window.innerWidth < MIN_WIDTH);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!tooSmall) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg)] text-[var(--fg)] flex flex-col items-center justify-center px-8 text-center">
      <div className="mono text-[10px] uppercase tracking-[0.3em] text-[var(--faint)] mb-6">
        · desktop only ·
      </div>
      <h1 className="serif text-4xl lowercase mb-4 leading-tight">
        this study log lives on bigger screens.
      </h1>
      <p className="text-sm text-[var(--muted)] max-w-md leading-relaxed mb-8">
        the syllabus tracker, embedded courses and revision tabs need real estate to feel right.
        please open this on a laptop or desktop for the intended experience.
      </p>
      <div className="mono text-[10px] uppercase tracking-widest text-[var(--faint)] border-t border-[var(--line)] pt-4">
        min width · {MIN_WIDTH}px
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { syllabus, type Section } from "@/lib/syllabus";

export const Route = createFileRoute("/")({
  component: Home,
});

const STORAGE_KEY = "gate-ae-progress-v1";
const NOTES_KEY = "gate-ae-notes-v1";

type Progress = Record<string, boolean>;
type Notes = Record<string, string>;

function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function loadNotes(): Notes {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}"); } catch { return {}; }
}

function topicKey(s: Section, t: string, p: string) {
  return `${s.id}::${t}::${p}`;
}

function sectionStats(s: Section, progress: Progress) {
  const all = [...s.core, ...s.special].flatMap((t) =>
    t.points.map((p) => topicKey(s, t.name, p))
  );
  const done = all.filter((k) => progress[k]).length;
  return { done, total: all.length, pct: all.length ? done / all.length : 0 };
}

function Home() {
  const [progress, setProgress] = useState<Progress>({});
  const [notes, setNotes] = useState<Notes>({});
  const [active, setActive] = useState<string>("math");
  const [view, setView] = useState<"syllabus" | "books" | "log">("syllabus");
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProgress(loadProgress());
    setNotes(loadNotes());
  }, []);

  useEffect(() => {
    if (Object.keys(progress).length || progress) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);
  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".fade-in", {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.04,
      });
    }, mainRef);
    return () => ctx.revert();
  }, [view, active]);

  const overall = useMemo(() => {
    const all = syllabus.flatMap((s) =>
      [...s.core, ...s.special].flatMap((t) =>
        t.points.map((p) => topicKey(s, t.name, p))
      )
    );
    const done = all.filter((k) => progress[k]).length;
    return { done, total: all.length, pct: all.length ? done / all.length : 0 };
  }, [progress]);

  const section = syllabus.find((s) => s.id === active)!;

  const toggle = (key: string) =>
    setProgress((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div ref={mainRef} className="min-h-screen">
      {/* top bar */}
      <header className="px-6 md:px-10 pt-8 pb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="serif text-2xl">gate ae</span>
          <span className="tag">prep log · 2026</span>
        </div>
        <div className="mono text-xs text-[var(--muted)]">
          {overall.done}/{overall.total} topics
        </div>
      </header>

      {/* progress bar */}
      <div className="px-6 md:px-10">
        <div className="bar">
          <i style={{ transform: `scaleX(${overall.pct})` }} />
        </div>
      </div>

      {/* view switch */}
      <nav className="px-6 md:px-10 pt-6 pb-8 flex gap-2">
        {(["syllabus", "books", "log"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`btn-ghost ${view === v ? "active" : ""}`}
          >
            {v}
          </button>
        ))}
      </nav>

      {view === "syllabus" && (
        <div className="grid grid-cols-12 gap-0 border-t border-[var(--line)]">
          {/* sections list */}
          <aside className="col-span-12 md:col-span-3 border-r border-[var(--line)] py-6">
            {syllabus.map((s) => {
              const st = sectionStats(s, progress);
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`fade-in w-full text-left px-6 md:px-10 py-4 block border-b border-[var(--line)] transition-colors ${isActive ? "bg-[var(--fg)] text-[var(--bg)]" : "hover:bg-[var(--line)]/40"}`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className={`mono text-[10px] ${isActive ? "text-[var(--bg)]/60" : "text-[var(--faint)]"}`}>
                        0{s.num}
                      </span>
                      <span className="serif text-lg">{s.title.toLowerCase()}</span>
                    </div>
                  </div>
                  <div className={`mono text-[10px] mt-1 ${isActive ? "text-[var(--bg)]/60" : "text-[var(--faint)]"}`}>
                    {st.done}/{st.total} · {Math.round(st.pct * 100)}%
                  </div>
                </button>
              );
            })}
          </aside>

          {/* section detail */}
          <main className="col-span-12 md:col-span-9 py-10 px-6 md:px-12">
            <div className="fade-in">
              <div className="section-num">section 0{section.num}</div>
              <h1 className="serif text-5xl md:text-6xl mt-2 mb-1 lowercase">
                {section.title}
              </h1>
              <div className="mono text-xs text-[var(--muted)]">
                {sectionStats(section, progress).done}/{sectionStats(section, progress).total} done
              </div>
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-12">
              <div className="fade-in">
                <div className="tag mb-4">core · 90% of qs</div>
                {section.core.map((t) => (
                  <div key={t.name} className="mb-8">
                    <div className="serif text-xl mb-3 lowercase">{t.name}</div>
                    <ul className="space-y-2">
                      {t.points.map((p) => {
                        const k = topicKey(section, t.name, p);
                        const done = !!progress[k];
                        return (
                          <li key={p} className="flex items-start gap-3 text-sm">
                            <input
                              type="checkbox"
                              className="check mt-1"
                              checked={done}
                              onChange={() => toggle(k)}
                            />
                            <span className={done ? "text-[var(--faint)] line-through" : ""}>
                              {p}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="fade-in">
                <div className="tag mb-4">special · 10% of qs</div>
                {section.special.length === 0 ? (
                  <div className="serif italic text-[var(--muted)]">none for this section.</div>
                ) : (
                  section.special.map((t) => (
                    <div key={t.name} className="mb-8">
                      <div className="serif text-xl mb-3 lowercase">{t.name}</div>
                      <ul className="space-y-2">
                        {t.points.map((p) => {
                          const k = topicKey(section, t.name, p);
                          const done = !!progress[k];
                          return (
                            <li key={p} className="flex items-start gap-3 text-sm">
                              <input
                                type="checkbox"
                                className="check mt-1"
                                checked={done}
                                onChange={() => toggle(k)}
                              />
                              <span className={done ? "text-[var(--faint)] line-through" : ""}>
                                {p}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))
                )}

                <div className="mt-10">
                  <div className="tag mb-3">notes</div>
                  <textarea
                    value={notes[section.id] || ""}
                    onChange={(e) =>
                      setNotes((n) => ({ ...n, [section.id]: e.target.value }))
                    }
                    placeholder="scratchpad. formulas, doubts, links..."
                    className="w-full min-h-[160px] text-sm leading-relaxed border border-[var(--line)] p-3 focus:border-[var(--fg)] transition-colors"
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {view === "books" && <BooksView />}
      {view === "log" && <LogView progress={progress} />}

      <footer className="px-6 md:px-10 py-10 mt-20 border-t border-[var(--line)] flex justify-between items-baseline">
        <span className="mono text-[10px] text-[var(--faint)] uppercase tracking-widest">
          local-first · saves to your browser
        </span>
        <span className="serif italic text-sm text-[var(--muted)]">keep at it.</span>
      </footer>
    </div>
  );
}

function BooksView() {
  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">books · pdfs</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">your shelf</h1>
      <p className="text-sm text-[var(--muted)] max-w-xl mb-10 leading-relaxed">
        drop pdfs inside the folders below (in <span className="mono">public/books/</span>),
        then rebuild. each section has its own shelf. keep filenames simple — author + title.
      </p>

      <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
        {syllabus.map((s) => (
          <div key={s.id} className="py-4 border-b border-[var(--line)] flex items-baseline justify-between gap-4">
            <div>
              <div className="mono text-[10px] text-[var(--faint)]">0{s.num}</div>
              <div className="serif text-xl lowercase">{s.title}</div>
            </div>
            <code className="mono text-xs text-[var(--muted)]">
              /books/{s.id}/
            </code>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 border border-[var(--line)] max-w-2xl">
        <div className="tag mb-2">suggested reads</div>
        <ul className="text-sm space-y-2 text-[var(--muted)]">
          <li>· anderson — fundamentals of aerodynamics</li>
          <li>· nelson — flight stability and automatic control</li>
          <li>· megson — aircraft structures for eng students</li>
          <li>· hill & peterson — mechanics and thermodynamics of propulsion</li>
          <li>· curtis — orbital mechanics for eng students</li>
          <li>· kreyszig — advanced engineering mathematics</li>
        </ul>
      </div>
    </div>
  );
}

function LogView({ progress }: { progress: Progress }) {
  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">log · overview</div>
      <h1 className="serif text-5xl mt-2 mb-10 lowercase">at a glance</h1>

      <div className="space-y-6 max-w-3xl">
        {syllabus.map((s) => {
          const st = sectionStats(s, progress);
          return (
            <div key={s.id} className="fade-in">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="mono text-[10px] text-[var(--faint)]">0{s.num}</span>
                  <span className="serif text-xl lowercase">{s.title}</span>
                </div>
                <span className="mono text-xs text-[var(--muted)]">
                  {st.done}/{st.total} · {Math.round(st.pct * 100)}%
                </span>
              </div>
              <div className="bar">
                <i style={{ transform: `scaleX(${st.pct})` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

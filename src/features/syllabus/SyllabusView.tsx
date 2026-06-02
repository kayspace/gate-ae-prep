import { syllabus } from "@/lib/syllabus";
import { sectionStats, topicKey } from "@/lib/syllabus-utils";
import type { Notes, Progress } from "@/types";

export function SyllabusView({
  progress,
  notes,
  active,
  setActive,
  toggle,
  setNotes,
}: {
  progress: Progress;
  notes: Notes;
  active: string;
  setActive: (id: string) => void;
  toggle: (key: string) => void;
  setNotes: React.Dispatch<React.SetStateAction<Notes>>;
}) {
  const section = syllabus.find((s) => s.id === active)!;
  const stats = sectionStats(section, progress);

  return (
    <div className="grid grid-cols-12 gap-0 border-t border-[var(--line)]">
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
                  <span
                    className={`mono text-[10px] ${isActive ? "text-[var(--bg)]/60" : "text-[var(--faint)]"}`}
                  >
                    0{s.num}
                  </span>
                  <span className="serif text-lg">{s.title.toLowerCase()}</span>
                </div>
              </div>
              <div
                className={`mono text-[10px] mt-1 ${isActive ? "text-[var(--bg)]/60" : "text-[var(--faint)]"}`}
              >
                {st.done}/{st.total} · {Math.round(st.pct * 100)}%
              </div>
            </button>
          );
        })}
      </aside>

      <main className="col-span-12 md:col-span-9 py-10 px-6 md:px-12">
        <div className="fade-in">
          <div className="section-num">section 0{section.num}</div>
          <h1 className="serif text-5xl md:text-6xl mt-2 mb-1 lowercase">{section.title}</h1>
          <div className="mono text-xs text-[var(--muted)]">
            {stats.done}/{stats.total} done
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-12">
          <div className="fade-in">
            <div className="tag mb-4">
              core{section.id === "aptitude" ? " · 15% of marks" : " · 90% of qs"}
            </div>
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
                        <span className={done ? "text-[var(--faint)] line-through" : ""}>{p}</span>
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
                onChange={(e) => setNotes((n) => ({ ...n, [section.id]: e.target.value }))}
                placeholder="scratchpad. formulas, doubts, links..."
                className="w-full min-h-[160px] text-sm leading-relaxed border border-[var(--line)] p-3 focus:border-[var(--fg)] transition-colors"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

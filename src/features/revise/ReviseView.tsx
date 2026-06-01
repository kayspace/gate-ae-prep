import { useState } from "react";
import { syllabus } from "@/lib/syllabus";
import type { ReviseItem, Revisions } from "@/types";

export function ReviseView({
  revisions,
  setRevisions,
}: {
  revisions: Revisions;
  setRevisions: React.Dispatch<React.SetStateAction<Revisions>>;
}) {
  const [active, setActive] = useState<string>("aptitude");
  const [draft, setDraft] = useState("");
  const items = revisions[active] || [];
  const pending = items.filter((i) => !i.done);
  const doneCount = items.length - pending.length;

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    const item: ReviseItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: t,
      done: false,
      createdAt: Date.now(),
    };
    setRevisions((r) => ({ ...r, [active]: [item, ...(r[active] || [])] }));
    setDraft("");
  };
  const toggle = (id: string) =>
    setRevisions((r) => ({
      ...r,
      [active]: (r[active] || []).map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    }));
  const remove = (id: string) =>
    setRevisions((r) => ({
      ...r,
      [active]: (r[active] || []).filter((i) => i.id !== id),
    }));
  const clearDone = () => {
    if (doneCount === 0) return;
    if (!window.confirm(`clear ${doneCount} revised item${doneCount > 1 ? "s" : ""}?`)) return;
    setRevisions((r) => ({ ...r, [active]: (r[active] || []).filter((i) => !i.done) }));
  };

  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">revise · queue</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">to be revised</h1>
      <p className="text-sm text-[var(--muted)] max-w-xl mb-8 leading-relaxed">
        track topics, problems, and assignments you need to come back to. tick them off as you
        revise. saves locally.
      </p>

      <div className="flex gap-2 flex-wrap mb-6">
        {syllabus.map((s) => {
          const c = (revisions[s.id] || []).filter((i) => !i.done).length;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`btn-ghost ${active === s.id ? "active" : ""}`}
            >
              {s.title.toLowerCase()}
              {c > 0 && <span className="ml-2 mono text-[10px] text-[var(--muted)]">{c}</span>}
            </button>
          );
        })}
      </div>

      <div className="fade-in max-w-3xl">
        <div className="flex gap-2 mb-6">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="e.g. revisit thin airfoil theory derivation, redo problem set 3 q4..."
            className="flex-1 text-sm border border-[var(--line)] bg-transparent px-3 py-2 focus:border-[var(--fg)] outline-none transition-colors"
          />
          <button onClick={add} className="btn-ghost active px-4">
            add
          </button>
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <span className="mono text-[10px] text-[var(--faint)] uppercase tracking-widest">
            {pending.length} pending · {doneCount} revised
          </span>
          {doneCount > 0 && (
            <button
              onClick={clearDone}
              className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest"
            >
              clear revised
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-[var(--faint)] py-8 italic">
            nothing queued for {active}. add something above.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {items.map((i) => (
              <li key={i.id} className="flex items-start gap-3 py-3 group">
                <input
                  type="checkbox"
                  checked={i.done}
                  onChange={() => toggle(i.id)}
                  className="mt-1 cursor-pointer accent-[var(--fg)]"
                />
                <span
                  className={`flex-1 text-sm leading-relaxed ${i.done ? "line-through text-[var(--faint)]" : ""}`}
                >
                  {i.text}
                </span>
                <button
                  onClick={() => remove(i.id)}
                  className="mono text-[10px] text-[var(--faint)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

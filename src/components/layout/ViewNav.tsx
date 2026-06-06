import type { ViewKey } from "@/types";

const VIEWS: ViewKey[] = ["syllabus", "books", "resources", "revise", "log", "guide", "feedback"];

export function ViewNav({ view, onChange }: { view: ViewKey; onChange: (v: ViewKey) => void }) {
  return (
    <nav className="px-6 md:px-10 pt-6 pb-8 flex gap-2 flex-wrap" data-tour="nav">
      {VIEWS.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`btn-ghost ${view === v ? "active" : ""}`}
        >
          {v}
        </button>
      ))}
    </nav>
  );
}

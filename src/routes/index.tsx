import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { syllabus, type Section } from "@/lib/syllabus";

export const Route = createFileRoute("/")({
  component: Home,
});

const STORAGE_KEY = "gate-ae-progress-v1";
const NOTES_KEY = "gate-ae-notes-v1";
const RESOURCES_KEY = "gate-ae-resources-v1";
const FORMULAS_KEY = "gate-ae-formulas-v1";

type Progress = Record<string, boolean>;
type Notes = Record<string, string>;
type Resource = {
  id: string;
  title: string;
  url: string;
  kind: "video" | "playlist" | "link";
  source?: "recommended" | "custom";
};
type Resources = Record<string, Resource[]>;
type Formulas = Record<string, string>;

const DEFAULT_RESOURCES: Resources = {
  aptitude: [
    {
      id: "default-aptitude-youtube",
      title: "Aptitude playlist",
      url: "https://youtube.com/playlist?list=PLC36xJgs4dxE43Au1FGRQvwHTr7NbgDCS",
      kind: "playlist",
      source: "recommended",
    },
  ],
  math: [
    {
      id: "default-math-youtube",
      title: "Engineering Mathematics playlist",
      url: "https://youtube.com/playlist?list=PLvTTv60o7qj_tdY9zH7YceES7jfXiZkAz",
      kind: "playlist",
      source: "recommended",
    },
    {
      id: "default-math-vector",
      title: "Vector algebra playlist",
      url: "https://youtube.com/playlist?list=PLqjFFrfKcY5yy_1N4MpMZjUHrlqDLVYEh",
      kind: "playlist",
      source: "recommended",
    },
  ],
  aero: [
    {
      id: "default-aero-fluid",
      title: "Fluid mechanics playlist",
      url: "https://youtube.com/playlist?list=PL9RcWoqXmzaLnlGN39w2-1jyFyI_ALVa3",
      kind: "playlist",
      source: "recommended",
    },
  ],
  structures: [
    {
      id: "default-structures-som",
      title: "Strength of Materials playlist",
      url: "https://youtube.com/playlist?list=PL9RcWoqXmzaLlfmNg2Ku1SdZtvXnYrLbc",
      kind: "playlist",
      source: "recommended",
    },
    {
      id: "default-structures-som-topics",
      title: "SOM Topics Visualized playlist",
      url: "https://youtube.com/playlist?list=PLEYqyyrm-hQ1kTm4Ce5uQzsHG89fXsIa5",
      kind: "playlist",
      source: "recommended",
    },
  ],
};

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function topicKey(s: Section, t: string, p: string) {
  return `${s.id}::${t}::${p}`;
}

function sectionStats(s: Section, progress: Progress) {
  const all = [...s.core, ...s.special].flatMap((t) => t.points.map((p) => topicKey(s, t.name, p)));
  const done = all.filter((k) => progress[k]).length;
  return { done, total: all.length, pct: all.length ? done / all.length : 0 };
}

function detectKind(url: string): Resource["kind"] {
  if (/youtube\.com\/playlist|list=/.test(url)) return "playlist";
  if (/youtube\.com|youtu\.be/.test(url)) return "video";
  return "link";
}

type ViewKey = "syllabus" | "books" | "resources" | "formulas" | "log";

function Home() {
  const [progress, setProgress] = useState<Progress>({});
  const [notes, setNotes] = useState<Notes>({});
  const [resources, setResources] = useState<Resources>({});
  const [formulas, setFormulas] = useState<Formulas>({});
  const [active, setActive] = useState<string>("aptitude");
  const [view, setView] = useState<ViewKey>("syllabus");
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProgress(loadJSON(STORAGE_KEY, {}));
    setNotes(loadJSON(NOTES_KEY, {}));
    const storedResources = loadJSON<Resources>(RESOURCES_KEY, {});
    const mergedResources: Resources = { ...storedResources };
    for (const key of Object.keys(DEFAULT_RESOURCES)) {
      if (!Object.prototype.hasOwnProperty.call(storedResources, key)) {
        mergedResources[key] = DEFAULT_RESOURCES[key];
      }
    }
    setResources(mergedResources);

    setFormulas(loadJSON(FORMULAS_KEY, {}));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
  }, [resources]);
  useEffect(() => {
    localStorage.setItem(FORMULAS_KEY, JSON.stringify(formulas));
  }, [formulas]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".fade-in", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.04,
      });
    }, mainRef);
    return () => ctx.revert();
  }, [view, active]);

  const overall = useMemo(() => {
    const all = syllabus.flatMap((s) =>
      [...s.core, ...s.special].flatMap((t) => t.points.map((p) => topicKey(s, t.name, p))),
    );
    const done = all.filter((k) => progress[k]).length;
    return { done, total: all.length, pct: all.length ? done / all.length : 0 };
  }, [progress]);

  const section = syllabus.find((s) => s.id === active)!;
  const toggle = (key: string) => setProgress((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div ref={mainRef} className="min-h-screen">
      <header className="px-6 md:px-10 pt-8 pb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="serif text-2xl">gate ae</span>
          <span className="tag">prep log · 2026</span>
        </div>
        <div className="mono text-xs text-[var(--muted)]">
          {overall.done}/{overall.total} topics
        </div>
      </header>

      <div className="px-6 md:px-10">
        <div className="bar">
          <i style={{ transform: `scaleX(${overall.pct})` }} />
        </div>
      </div>

      <nav className="px-6 md:px-10 pt-6 pb-8 flex gap-2 flex-wrap">
        {(["syllabus", "books", "resources", "formulas", "log"] as const).map((v) => (
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
                {sectionStats(section, progress).done}/{sectionStats(section, progress).total} done
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
                    onChange={(e) => setNotes((n) => ({ ...n, [section.id]: e.target.value }))}
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
      {view === "resources" && <ResourcesView resources={resources} setResources={setResources} />}
      {view === "formulas" && <FormulasView formulas={formulas} setFormulas={setFormulas} />}
      {view === "log" && <LogView progress={progress} />}

      <footer className="px-6 md:px-10 py-10 mt-20 border-t border-[var(--line)] flex flex-wrap gap-4 justify-between items-baseline">
        <span className="mono text-[10px] text-[var(--faint)] uppercase tracking-widest">
          local-first · saves to your browser
        </span>
        <span className="mono text-[10px] text-[var(--faint)] uppercase tracking-widest">
          ui inspo ·{" "}
          <a
            href="https://kayspace.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="link-u text-[var(--muted)] hover:text-[var(--fg)]"
          >
            kayspace
          </a>
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
        drop pdfs inside the folders below (in <span className="mono">public/books/</span>), then
        rebuild. each section has its own shelf. keep filenames simple — author + title.
      </p>

      <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
        {syllabus.map((s) => (
          <div
            key={s.id}
            className="py-4 border-b border-[var(--line)] flex items-baseline justify-between gap-4"
          >
            <div>
              <div className="mono text-[10px] text-[var(--faint)]">0{s.num}</div>
              <div className="serif text-xl lowercase">{s.title}</div>
            </div>
            <code className="mono text-xs text-[var(--muted)]">/books/{s.id}/</code>
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

function ResourcesView({
  resources,
  setResources,
}: {
  resources: Resources;
  setResources: React.Dispatch<React.SetStateAction<Resources>>;
}) {
  const [active, setActive] = useState<string>("aptitude");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const list = resources[active] || [];

  const add = () => {
    if (!url.trim()) return;
    const r: Resource = {
      id: crypto.randomUUID(),
      title: title.trim() || url.trim(),
      url: url.trim(),
      kind: detectKind(url.trim()),
      source: "custom",
    };
    setResources((prev) => ({ ...prev, [active]: [...(prev[active] || []), r] }));
    setTitle("");
    setUrl("");
  };

  const remove = (id: string) =>
    setResources((prev) => ({
      ...prev,
      [active]: (prev[active] || []).filter((r) => r.id !== id),
    }));

  const beginEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setEditTitle(resource.title);
    setEditUrl(resource.url);
  };

  const saveEdit = () => {
    if (!editingId || !editUrl.trim()) return;
    setResources((prev) => ({
      ...prev,
      [active]: (prev[active] || []).map((r) =>
        r.id === editingId
          ? {
              ...r,
              title: editTitle.trim() || editUrl.trim(),
              url: editUrl.trim(),
              kind: detectKind(editUrl.trim()),
              source: "custom",
            }
          : r,
      ),
    }));
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  };

  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">resources · videos & links</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">what you're watching</h1>
      <p className="text-sm text-[var(--muted)] max-w-xl mb-8 leading-relaxed">
        paste any yt video, playlist, or link you're using for a subject. saved to your browser.
      </p>

      <div className="flex gap-2 flex-wrap mb-8">
        {syllabus.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`btn-ghost ${active === s.id ? "active" : ""}`}
          >
            {s.title.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="fade-in">
          <div className="tag mb-3">add a link</div>
          <div className="space-y-3 border border-[var(--line)] p-4">
            <div className="mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
              Recommended entries appear automatically; you can still add your own link or edit any
              item.
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title (optional)"
              className="w-full text-sm border-b border-[var(--line)] py-2 focus:border-[var(--fg)] transition-colors"
            />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full text-sm mono border-b border-[var(--line)] py-2 focus:border-[var(--fg)] transition-colors"
            />
            <button onClick={add} className="btn-ghost active">
              add
            </button>
          </div>
        </div>

        <div className="fade-in">
          <div className="tag mb-3">{list.length} saved</div>
          {list.length === 0 ? (
            <div className="serif italic text-[var(--muted)]">nothing here yet.</div>
          ) : (
            <ul className="space-y-3">
              {list.map((r) => (
                <li key={r.id} className="border-b border-[var(--line)] pb-3 flex flex-col gap-3">
                  {editingId === r.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="title"
                        className="w-full text-sm border border-[var(--line)] p-2 focus:border-[var(--fg)] transition-colors"
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="w-full text-sm mono border border-[var(--line)] p-2 focus:border-[var(--fg)] transition-colors"
                      />
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={saveEdit} className="btn-ghost active">
                          save
                        </button>
                        <button onClick={cancelEdit} className="btn-ghost">
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="serif text-lg lowercase link-u block truncate"
                        >
                          {r.title}
                        </a>
                        <div className="mono text-[10px] text-[var(--faint)] mt-1 uppercase tracking-widest flex flex-wrap gap-2 items-center">
                          <span>{r.kind}</span>
                          <span>·</span>
                          <span className="lowercase tracking-normal truncate">{r.url}</span>
                          {r.source === "recommended" && (
                            <span className="px-2 py-1 rounded-full bg-[var(--line)] text-[var(--muted)] text-[10px] uppercase tracking-[0.15em]">
                              recommended
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap sm:flex-col sm:items-end">
                        <button
                          onClick={() => beginEdit(r)}
                          className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest shrink-0"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest shrink-0"
                        >
                          remove
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function FormulasView({
  formulas,
  setFormulas,
}: {
  formulas: Formulas;
  setFormulas: React.Dispatch<React.SetStateAction<Formulas>>;
}) {
  const [active, setActive] = useState<string>("aptitude");
  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">formulas · cheatsheets</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">formula sheets</h1>
      <p className="text-sm text-[var(--muted)] max-w-xl mb-8 leading-relaxed">
        one per section. dump the formulas you need to remember. plain text, saves locally.
      </p>

      <div className="flex gap-2 flex-wrap mb-6">
        {syllabus.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`btn-ghost ${active === s.id ? "active" : ""}`}
          >
            {s.title.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="fade-in">
        <textarea
          value={formulas[active] || ""}
          onChange={(e) => setFormulas((f) => ({ ...f, [active]: e.target.value }))}
          placeholder={`formulas for ${active}...\n\nlift = 0.5 * rho * v^2 * S * Cl\n...`}
          className="w-full min-h-[60vh] text-sm mono leading-relaxed border border-[var(--line)] p-4 focus:border-[var(--fg)] transition-colors"
        />
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

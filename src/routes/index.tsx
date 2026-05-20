import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { syllabus, type Section } from "@/lib/syllabus";
import { books as booksData } from "@/lib/books";

export const Route = createFileRoute("/")({
  component: Home,
});

const STORAGE_KEY = "gate-ae-progress-v1";
const NOTES_KEY = "gate-ae-notes-v1";
const RESOURCES_KEY = "gate-ae-resources-v2";
const REVISE_KEY = "gate-ae-revise-v1";
const YT_KEY = "gate-ae-yt-key-v1";
const WATCH_KEY = "gate-ae-watch-v1";

type WatchState = { watched: number; pos: number; dur: number };
type WatchMap = Record<string, WatchState>;

function loadWatch(videoId: string): WatchState {
  if (typeof window === "undefined") return { watched: 0, pos: 0, dur: 0 };
  try {
    const all = JSON.parse(localStorage.getItem(WATCH_KEY) || "{}") as WatchMap;
    return all[videoId] || { watched: 0, pos: 0, dur: 0 };
  } catch {
    return { watched: 0, pos: 0, dur: 0 };
  }
}
function saveWatch(videoId: string, s: WatchState) {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(WATCH_KEY) || "{}") as WatchMap;
    all[videoId] = s;
    localStorage.setItem(WATCH_KEY, JSON.stringify(all));
  } catch {}
}
function clearWatchFor(videoIds: string[]) {
  if (typeof window === "undefined" || videoIds.length === 0) return;
  try {
    const all = JSON.parse(localStorage.getItem(WATCH_KEY) || "{}") as WatchMap;
    for (const id of videoIds) delete all[id];
    localStorage.setItem(WATCH_KEY, JSON.stringify(all));
  } catch {}
}

type Progress = Record<string, boolean>;
type Notes = Record<string, string>;
type PlaylistVideo = { videoId: string; title: string; thumb: string; done: boolean };
type Resource = {
  id: string;
  title: string;
  url: string;
  kind: "video" | "playlist" | "link";
  playlistId?: string;
  videos?: PlaylistVideo[];
  loading?: boolean;
  error?: string;
  source?: "default" | "custom" | "recommended";
};
type Resources = Record<string, Resource[]>;
type ReviseItem = { id: string; text: string; done: boolean; createdAt: number };
type Revisions = Record<string, ReviseItem[]>;

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
  if (/youtube\.com\/playlist|[?&]list=/.test(url)) return "playlist";
  if (/youtube\.com|youtu\.be/.test(url)) return "video";
  return "link";
}

function extractPlaylistId(url: string): string | null {
  const m = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

async function fetchPlaylistVideos(playlistId: string, apiKey: string): Promise<PlaylistVideo[]> {
  const out: PlaylistVideo[] = [];
  let pageToken = "";
  for (let i = 0; i < 20; i++) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(apiKey)}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`yt api ${res.status}: ${txt.slice(0, 200)}`);
    }
    const data = await res.json();
    for (const item of data.items || []) {
      const vid = item.contentDetails?.videoId;
      if (!vid) continue;
      out.push({
        videoId: vid,
        title: item.snippet?.title || vid,
        thumb: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
        done: false,
      });
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return out;
}

function fmtSize(n: number) {
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} mb`;
  return `${Math.round(n / 1024)} kb`;
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
    // migrate v1 -> v2 if needed
    const v2 = loadJSON<Resources | null>(RESOURCES_KEY, null);
    if (v2) setResources(v2);
    else setResources(loadJSON("gate-ae-resources-v1", {}));
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
      {view === "log" && <LogView progress={progress} resources={resources} />}

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
        drop pdfs inside <span className="mono">public/books/&lt;section&gt;/</span> and they show up here on next dev/build.
        click to open in a new tab.
      </p>

      <div className="space-y-10">
        {syllabus.map((s) => {
          const list = booksData[s.id] || [];
          return (
            <div key={s.id} className="fade-in">
              <div className="flex items-baseline justify-between mb-3 border-b border-[var(--line)] pb-2">
                <div className="flex items-baseline gap-3">
                  <span className="mono text-[10px] text-[var(--faint)]">0{s.num}</span>
                  <span className="serif text-2xl lowercase">{s.title}</span>
                </div>
                <span className="mono text-[10px] text-[var(--muted)]">{list.length} {list.length === 1 ? "book" : "books"}</span>
              </div>
              {list.length === 0 ? (
                <div className="serif italic text-sm text-[var(--muted)]">
                  empty. drop a pdf into <span className="mono not-italic">/public/books/{s.id}/</span>
                </div>
              ) : (
                <ul className="grid md:grid-cols-2 gap-x-8">
                  {list.map((b) => (
                    <li key={b.file} className="py-3 border-b border-[var(--line)] flex items-start justify-between gap-3">
                      <a
                        href={`/books/${s.id}/${encodeURIComponent(b.file)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="serif text-base lowercase link-u min-w-0 truncate"
                        title={b.name}
                      >
                        {b.name.toLowerCase()}
                      </a>
                      <span className="mono text-[10px] text-[var(--faint)] shrink-0 uppercase tracking-widest">
                        {fmtSize(b.size)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- YouTube IFrame Player API loader (singleton) ----
let ytApiPromise: Promise<any> | null = null;
function loadYouTubeAPI(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev && prev();
      resolve(w.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

// Anti-skip: only count time deltas that look like real playback (≤2.5s — covers up to 2x speed).
// Mark done when watched ≥ 90% of duration.
function EmbeddedPlayer({
  videoId,
  alreadyDone,
  onComplete,
}: {
  videoId: string;
  alreadyDone: boolean;
  onComplete: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const tickRef = useRef<number | null>(null);
  const watchedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const durRef = useRef(0);
  const saveCounterRef = useRef(0);
  const completedRef = useRef(alreadyDone);
  const [pct, setPct] = useState(0);
  const [resumeAt, setResumeAt] = useState(0);

  // hydrate from localStorage once per videoId
  useEffect(() => {
    const s = loadWatch(videoId);
    watchedRef.current = s.watched;
    durRef.current = s.dur;
    setResumeAt(s.pos);
    if (s.dur > 0) setPct(Math.min(1, s.watched / s.dur));
  }, [videoId]);

  useEffect(() => {
    let cancelled = false;
    let player: any = null;

    const persist = () => {
      saveWatch(videoId, {
        watched: watchedRef.current,
        pos: lastTimeRef.current,
        dur: durRef.current,
      });
    };

    loadYouTubeAPI().then((YT) => {
      if (cancelled || !hostRef.current) return;
      player = new YT.Player(hostRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, start: Math.floor(resumeAt) || 0 },
        events: {
          onReady: (e: any) => {
            try {
              const d = e.target.getDuration?.() || 0;
              if (d > 0) durRef.current = d;
              if (resumeAt > 1 && resumeAt < (d || Infinity) - 2) {
                e.target.seekTo(resumeAt, true);
              }
            } catch {}
          },
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.PLAYING) startTick();
            else {
              stopTick();
              persist();
            }
          },
        },
      });
      playerRef.current = player;
    });

    const startTick = () => {
      if (tickRef.current != null) return;
      lastTimeRef.current = playerRef.current?.getCurrentTime?.() || 0;
      tickRef.current = window.setInterval(() => {
        const p = playerRef.current;
        if (!p?.getCurrentTime) return;
        const t = p.getCurrentTime();
        const d = p.getDuration?.() || durRef.current || 0;
        if (d > 0) durRef.current = d;
        const delta = t - lastTimeRef.current;
        if (delta > 0 && delta <= 2.5) watchedRef.current += delta;
        lastTimeRef.current = t;
        if (d > 0) {
          const ratio = watchedRef.current / d;
          setPct(Math.min(1, ratio));
          if (!completedRef.current && ratio >= 0.9) {
            completedRef.current = true;
            onComplete();
          }
        }
        // save every ~3 ticks
        saveCounterRef.current += 1;
        if (saveCounterRef.current % 3 === 0) persist();
      }, 1000);
    };
    const stopTick = () => {
      if (tickRef.current != null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };

    const onVisibility = () => persist();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", persist);

    return () => {
      cancelled = true;
      stopTick();
      persist();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", persist);
      try { playerRef.current?.destroy?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, resumeAt]);

  return (
    <div className="mt-3">
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <div ref={hostRef} className="absolute inset-0 w-full h-full bg-black" />
      </div>
      <div className="mt-2 flex items-center gap-3 mono text-[10px] text-[var(--muted)] uppercase tracking-widest">
        <span>watched {Math.round(pct * 100)}%</span>
        <div className="flex-1 h-px bg-[var(--line)] relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-[var(--fg)]" style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
        {resumeAt > 1 && pct < 0.9 && (
          <span>resumed @ {Math.floor(resumeAt / 60)}:{String(Math.floor(resumeAt % 60)).padStart(2, "0")}</span>
        )}
        <span>{completedRef.current ? "✓ done" : "auto-ticks at 90%"}</span>
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
  const [apiKey, setApiKey] = useState<string>("");
  const [showKey, setShowKey] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [watchingVid, setWatchingVid] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(typeof window === "undefined" ? "" : (localStorage.getItem(YT_KEY) || ""));
  }, []);

  const saveKey = (v: string) => {
    setApiKey(v);
    if (v) localStorage.setItem(YT_KEY, v);
    else localStorage.removeItem(YT_KEY);
  };

  const list = resources[active] || [];

  const updateResource = (id: string, patch: Partial<Resource>) => {
    setResources((prev) => ({
      ...prev,
      [active]: (prev[active] || []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  };

  const loadPlaylist = async (r: Resource) => {
    if (!r.playlistId) return;
    if (!apiKey) {
      updateResource(r.id, { error: "add a youtube data api key below first." });
      return;
    }
    updateResource(r.id, { loading: true, error: undefined });
    try {
      const vids = await fetchPlaylistVideos(r.playlistId, apiKey);
      // preserve old "done" state by videoId if reloading
      const prevDone = new Map((r.videos || []).map((v) => [v.videoId, v.done]));
      const merged = vids.map((v) => ({ ...v, done: prevDone.get(v.videoId) ?? false }));
      updateResource(r.id, { videos: merged, loading: false });
    } catch (e: any) {
      updateResource(r.id, { loading: false, error: e.message || "fetch failed" });
    }
  };

  const add = async () => {
    const u = url.trim();
    if (!u) return;
    const kind = detectKind(u);
    const playlistId = kind === "playlist" ? extractPlaylistId(u) : undefined;
    const r: Resource = {
      id: crypto.randomUUID(),
      title: title.trim() || u,
      url: u,
      kind,
      playlistId: playlistId || undefined,
    };
    setResources((prev) => ({ ...prev, [active]: [...(prev[active] || []), r] }));
    setTitle(""); setUrl("");
    if (kind === "playlist" && playlistId && apiKey) {
      // auto-fetch
      setTimeout(() => {
        loadPlaylist(r);
        setOpenId(r.id);
      }, 0);
    }
  };

  const remove = (id: string) => {
    const r = (resources[active] || []).find((x) => x.id === id);
    if (!r) return;
    const doneCount = r.videos?.filter((v) => v.done).length || 0;
    const total = r.videos?.length || 0;
    let msg: string;
    if (r.kind === "playlist") {
      msg = doneCount > 0
        ? `remove "${r.title}"?\n\nyour progress (${doneCount}/${total} videos completed + per-video watch positions) will be lost. you'll start from scratch if you re-add it.`
        : `remove "${r.title}"?\n\nany saved watch positions for its videos will also be wiped.`;
    } else {
      msg = `remove "${r.title}"?`;
    }
    const ok = typeof window !== "undefined" && window.confirm(msg);
    if (!ok) return;
    if (r.videos?.length) clearWatchFor(r.videos.map((v) => v.videoId));
    if (watchingVid?.startsWith(`${r.id}::`)) setWatchingVid(null);
    setResources((prev) => ({
      ...prev,
      [active]: (prev[active] || []).filter((x) => x.id !== id),
    }));
  };


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

  const toggleVideo = (rid: string, vid: string) => {
    setResources((prev) => ({
      ...prev,
      [active]: (prev[active] || []).map((r) =>
        r.id === rid
          ? { ...r, videos: (r.videos || []).map((v) => v.videoId === vid ? { ...v, done: !v.done } : v) }
          : r,
      ),
    }));
  };

  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">resources · videos & courses</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">what you're watching</h1>
      <p className="text-sm text-[var(--muted)] max-w-2xl mb-8 leading-relaxed">
        paste any yt video, playlist, or link. playlists turn into courses — every video gets a tick + progress bar.
        needs a free youtube data api key (one-time, saved to your browser).
      </p>

      {/* yt api key */}
      <div className="mb-10 border border-[var(--line)] p-4 max-w-2xl">
        <div className="flex items-baseline justify-between mb-2">
          <span className="tag">yt data api key {apiKey ? "· set" : "· not set"}</span>
          <button onClick={() => setShowKey((s) => !s)} className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest">
            {showKey ? "hide" : "show"}
          </button>
        </div>
        {showKey && (
          <>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="AIza..."
              className="w-full text-sm mono border-b border-[var(--line)] py-2 focus:border-[var(--fg)] transition-colors"
            />
            <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">
              get one free at <a className="link-u" href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">console.cloud.google.com</a> → create project → enable <span className="mono">YouTube Data API v3</span> → create api key.
            </p>
          </>
        )}
      </div>

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

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 fade-in">
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
              placeholder="https://youtube.com/playlist?list=..."
              className="w-full text-sm mono border-b border-[var(--line)] py-2 focus:border-[var(--fg)] transition-colors"
            />
            <button onClick={add} className="btn-ghost active">add</button>
            <p className="text-[10px] mono text-[var(--faint)] uppercase tracking-widest">
              playlists auto-load as courses
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 fade-in">
          <div className="tag mb-3">{list.length} saved</div>
          {list.length === 0 ? (
            <div className="serif italic text-[var(--muted)]">nothing here yet.</div>
          ) : (
            <ul className="space-y-6">
              {list.map((r) => {
                const isPlaylist = r.kind === "playlist";
                const total = r.videos?.length || 0;
                const done = r.videos?.filter((v) => v.done).length || 0;
                const pct = total ? done / total : 0;
                const open = openId === r.id;
                return (
                  <li key={r.id} className="border border-[var(--line)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <a href={r.url} target="_blank" rel="noreferrer" className="serif text-lg lowercase link-u block truncate">
                          {r.title}
                        </a>
                        <div className="mono text-[10px] text-[var(--faint)] mt-1 uppercase tracking-widest">
                          {r.kind} {isPlaylist && total > 0 && `· ${done}/${total} · ${Math.round(pct * 100)}%`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {isPlaylist && (
                          <button
                            onClick={() => {
                              setOpenId(open ? null : r.id);
                              if (!r.videos && !open) loadPlaylist(r);
                            }}
                            className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest"
                          >
                            {open ? "close" : (r.videos ? "open" : "load")}
                          </button>
                        )}
                        {isPlaylist && r.videos && (
                          <button onClick={() => loadPlaylist(r)} className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest">
                            refresh
                          </button>
                        )}
                        <button onClick={() => remove(r.id)} className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest">
                          remove
                        </button>
                      </div>
                    </div>

                    {isPlaylist && total > 0 && (
                      <div className="mt-3 bar"><i style={{ transform: `scaleX(${pct})` }} /></div>
                    )}

                    {isPlaylist && r.loading && (
                      <div className="mt-3 mono text-xs text-[var(--muted)]">loading playlist…</div>
                    )}
                    {isPlaylist && r.error && (
                      <div className="mt-3 mono text-xs text-[color:var(--fg)] bg-[var(--line)]/40 p-2">
                        {r.error}
                      </div>
                    )}

                    {isPlaylist && open && r.videos && r.videos.length > 0 && (
                      <ul className="mt-4 divide-y divide-[var(--line)]">
                        {r.videos.map((v, idx) => {
                          const watchKey = `${r.id}::${v.videoId}`;
                          const isWatching = watchingVid === watchKey;
                          return (
                            <li key={v.videoId} className="py-2">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  className="check shrink-0"
                                  checked={v.done}
                                  onChange={() => toggleVideo(r.id, v.videoId)}
                                />
                                <span className="mono text-[10px] text-[var(--faint)] w-6 shrink-0">
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                {v.thumb && (
                                  <img src={v.thumb} alt="" loading="lazy" className="w-16 h-10 object-cover shrink-0" />
                                )}
                                <span
                                  className={`text-sm min-w-0 truncate flex-1 ${v.done ? "text-[var(--faint)] line-through" : ""}`}
                                  title={v.title}
                                >
                                  {v.title}
                                </span>
                                <button
                                  onClick={() => setWatchingVid(isWatching ? null : watchKey)}
                                  className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest shrink-0"
                                >
                                  {isWatching ? "close" : "watch"}
                                </button>
                                <a
                                  href={`https://www.youtube.com/watch?v=${v.videoId}&list=${r.playlistId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest shrink-0"
                                  title="open on youtube"
                                >
                                  ↗
                                </a>
                              </div>
                              {isWatching && (
                                <EmbeddedPlayer
                                  videoId={v.videoId}
                                  alreadyDone={v.done}
                                  onComplete={() => {
                                    if (!v.done) toggleVideo(r.id, v.videoId);
                                  }}
                                />
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
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

function LogView({ progress, resources }: { progress: Progress; resources: Resources }) {
  // course progress aggregate
  const courses = Object.entries(resources).flatMap(([sid, list]) =>
    (list || []).filter((r) => r.kind === "playlist" && r.videos && r.videos.length > 0).map((r) => ({ sid, r }))
  );

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

      {courses.length > 0 && (
        <div className="mt-16 max-w-3xl">
          <div className="tag mb-4">courses in progress</div>
          <div className="space-y-5">
            {courses.map(({ sid, r }) => {
              const total = r.videos!.length;
              const done = r.videos!.filter((v) => v.done).length;
              const pct = done / total;
              const section = syllabus.find((s) => s.id === sid);
              return (
                <div key={r.id} className="fade-in">
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="min-w-0">
                      <div className="serif text-base lowercase truncate">{r.title}</div>
                      <div className="mono text-[10px] text-[var(--faint)] uppercase tracking-widest">
                        {section?.title.toLowerCase()}
                      </div>
                    </div>
                    <span className="mono text-xs text-[var(--muted)] shrink-0">
                      {done}/{total} · {Math.round(pct * 100)}%
                    </span>
                  </div>
                  <div className="bar"><i style={{ transform: `scaleX(${pct})` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

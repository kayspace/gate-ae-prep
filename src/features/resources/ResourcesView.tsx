import { useEffect, useState } from "react";
import { syllabus } from "@/lib/syllabus";
import { clearWatchFor, STORAGE_KEYS } from "@/lib/storage";
import { detectKind, extractPlaylistId, fetchPlaylistVideos } from "@/lib/youtube";
import type { Resource, Resources, ViewKey } from "@/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { YtApiKeyBox } from "./YtApiKeyBox";
import { ResourceItem } from "./ResourceItem";

export function ResourcesView({
  resources,
  setResources,
  setView,
}: {
  resources: Resources;
  setResources: React.Dispatch<React.SetStateAction<Resources>>;
  setView: React.Dispatch<React.SetStateAction<ViewKey>>;
}) {
  const [active, setActive] = useState<string>("aptitude");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [watchingVid, setWatchingVid] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    setApiKey(typeof window === "undefined" ? "" : localStorage.getItem(STORAGE_KEYS.ytKey) || "");
  }, []);

  const saveKey = (v: string) => {
    setApiKey(v);
    if (v) localStorage.setItem(STORAGE_KEYS.ytKey, v);
    else localStorage.removeItem(STORAGE_KEYS.ytKey);
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
    setTitle("");
    setUrl("");
    if (kind === "playlist" && playlistId && apiKey) {
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
    let message: string;
    if (r.kind === "playlist") {
      message =
        doneCount > 0
          ? `remove "${r.title}"? your progress (${doneCount}/${total} videos completed + per-video watch positions) will be lost. you'll start from scratch if you re-add it.`
          : `remove "${r.title}"? any saved watch positions for its videos will also be wiped.`;
    } else {
      message = `remove "${r.title}"?`;
    }
    setConfirmState({
      title: "remove resource",
      message,
      confirmLabel: "remove",
      onConfirm: () => {
        if (r.videos?.length)
          clearWatchFor(r.videos.flatMap((v) => [`${r.id}::${v.videoId}`, v.videoId]));
        if (watchingVid?.startsWith(`${r.id}::`)) setWatchingVid(null);
        setResources((prev) => ({
          ...prev,
          [active]: (prev[active] || []).filter((x) => x.id !== id),
        }));
      },
    });
  };

  const toggleVideo = (rid: string, vid: string) => {
    setResources((prev) => ({
      ...prev,
      [active]: (prev[active] || []).map((r) =>
        r.id === rid
          ? {
              ...r,
              videos: (r.videos || []).map((v) =>
                v.videoId === vid ? { ...v, done: !v.done } : v,
              ),
            }
          : r,
      ),
    }));
  };

  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <ConfirmModal
        open={!!confirmState}
        title={confirmState?.title || ""}
        message={confirmState?.message || ""}
        confirmLabel={confirmState?.confirmLabel}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          confirmState?.onConfirm();
          setConfirmState(null);
        }}
      />
      <div className="section-num">resources · videos & courses</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">what you're watching</h1>
      <p className="text-sm text-[var(--muted)] max-w-2xl mb-8 leading-relaxed">
        ✦ paste any yt video, playlist, or link. playlists turn into courses — every video gets a
        tick + progress bar. needs a free youtube data api key (one-time, saved to your browser).{" "}
        <button
          onClick={() => setView("guide")}
          className="text-[var(--muted)] hover:text-[var(--fg)] bg-none border-none p-0 cursor-pointer inline underline"
        >
          see guide
        </button>{" "}
        for full details.
      </p>

      <YtApiKeyBox apiKey={apiKey} onChange={saveKey} />

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
            <button onClick={add} className="btn-ghost active">
              add
            </button>
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
              {list.map((r) => (
                <ResourceItem
                  key={r.id}
                  r={r}
                  open={openId === r.id}
                  watchingVid={watchingVid}
                  onToggleOpen={() => {
                    const isOpen = openId === r.id;
                    setOpenId(isOpen ? null : r.id);
                    if (!r.videos && !isOpen) loadPlaylist(r);
                  }}
                  onLoadPlaylist={() => loadPlaylist(r)}
                  onRemove={() => remove(r.id)}
                  onToggleVideo={(vid) => toggleVideo(r.id, vid)}
                  onSetWatching={setWatchingVid}
                  onSaveEdit={(patch) => updateResource(r.id, patch)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import type { Resource } from "@/types";
import { EmbeddedPlayer } from "@/components/EmbeddedPlayer";
import { detectKind, extractVideoId } from "@/lib/youtube";

export function ResourceItem({
  r,
  open,
  watchingVid,
  onToggleOpen,
  onLoadPlaylist,
  onRemove,
  onToggleVideo,
  onSetWatching,
  onSaveEdit,
}: {
  r: Resource;
  open: boolean;
  watchingVid: string | null;
  onToggleOpen: () => void;
  onLoadPlaylist: () => void;
  onRemove: () => void;
  onToggleVideo: (vid: string) => void;
  onSetWatching: (key: string | null) => void;
  onSaveEdit: (patch: Partial<Resource>) => void;
}) {
  const isPlaylist = r.kind === "playlist";
  const isVideo = r.kind === "video";
  const singleVideoId = isVideo ? extractVideoId(r.url) : null;
  const singleWatchKey = singleVideoId ? `${r.id}::${singleVideoId}` : "";
  const singleIsWatching = !!singleVideoId && watchingVid === singleWatchKey;
  const total = r.videos?.length || 0;
  const done = r.videos?.filter((v) => v.done).length || 0;
  const pct = total ? done / total : 0;

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(r.title);
  const [editUrl, setEditUrl] = useState(r.url);

  const beginEdit = () => {
    setEditTitle(r.title);
    setEditUrl(r.url);
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = () => {
    const u = editUrl.trim();
    if (!u) return;
    onSaveEdit({
      title: editTitle.trim() || u,
      url: u,
      kind: detectKind(u),
      source: "custom",
    });
    setEditing(false);
  };

  return (
    <li className="border border-[var(--line)] p-4">
      {editing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="title"
            className="w-full text-sm border-b border-[var(--line)] py-2 focus:border-[var(--fg)] transition-colors"
          />
          <input
            type="text"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="url"
            className="w-full text-sm mono border-b border-[var(--line)] py-2 focus:border-[var(--fg)] transition-colors"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={cancelEdit} className="btn-ghost">
              cancel
            </button>
            <button onClick={saveEdit} className="btn-ghost active">
              save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="serif text-lg lowercase link-u block truncate"
            >
              {r.title}
            </a>
            <div className="mono text-[10px] text-[var(--faint)] mt-1 uppercase tracking-widest">
              {r.kind} {isPlaylist && total > 0 && `· ${done}/${total} · ${Math.round(pct * 100)}%`}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isPlaylist && (
              <button
                onClick={onToggleOpen}
                className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest"
              >
                {open ? "close" : r.videos ? "open" : "load"}
              </button>
            )}
            {isPlaylist && r.videos && (
              <button
                onClick={onLoadPlaylist}
                className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest"
              >
                refresh
              </button>
            )}
            <button
              onClick={beginEdit}
              className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest"
            >
              edit
            </button>
            <button
              onClick={onRemove}
              className="mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] uppercase tracking-widest"
            >
              remove
            </button>
          </div>
        </div>
      )}

      {isPlaylist && total > 0 && (
        <div className="mt-3 bar">
          <i style={{ transform: `scaleX(${pct})` }} />
        </div>
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
                    onChange={() => onToggleVideo(v.videoId)}
                  />
                  <span className="mono text-[10px] text-[var(--faint)] w-6 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {v.thumb && (
                    <img
                      src={v.thumb}
                      alt=""
                      loading="lazy"
                      className="w-16 h-10 object-cover shrink-0"
                    />
                  )}
                  <span
                    className={`text-sm min-w-0 truncate flex-1 ${v.done ? "text-[var(--faint)] line-through" : ""}`}
                    title={v.title}
                  >
                    {v.title}
                  </span>
                  <button
                    onClick={() => onSetWatching(isWatching ? null : watchKey)}
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
                    watchKey={watchKey}
                    alreadyDone={v.done}
                    onComplete={() => {
                      if (!v.done) onToggleVideo(v.videoId);
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
}

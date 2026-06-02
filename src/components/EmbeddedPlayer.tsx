import { useEffect, useRef, useState } from "react";
import { loadYouTubeAPI } from "@/lib/youtube";
import { loadWatch, saveWatch } from "@/lib/storage";

// anti-skip: only count time deltas that look like real playback (≤2.5s — covers up to 2x speed).
// marks done once watched ≥ 90% of duration.
export function EmbeddedPlayer({
  videoId,
  watchKey,
  alreadyDone,
  onComplete,
}: {
  videoId: string;
  watchKey: string;
  alreadyDone: boolean;
  onComplete: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const tickRef = useRef<number | null>(null);
  const completedRef = useRef(alreadyDone);

  // read stored state ONCE synchronously at mount, never from React state
  const initRef = useRef(() => loadWatch(watchKey, videoId));
  const init = initRef.current();

  const watchedRef = useRef(init.watched);
  const lastTimeRef = useRef(init.pos); // seeded with saved pos, not 0
  const durRef = useRef(init.dur);
  const saveCounterRef = useRef(0);

  const [pct, setPct] = useState(init.dur > 0 ? Math.min(1, init.watched / init.dur) : 0);
  const resumeAt = init.pos; // plain const — no re-renders, no effect deps

  useEffect(() => {
    let cancelled = false;

    const persist = () => {
      const livePos = playerRef.current?.getCurrentTime?.();
      const posToSave =
        typeof livePos === "number" && !Number.isNaN(livePos) ? livePos : lastTimeRef.current;
      lastTimeRef.current = posToSave;
      saveWatch(watchKey, {
        watched: watchedRef.current,
        pos: posToSave,
        dur: durRef.current,
      });
    };

    loadYouTubeAPI().then((YT) => {
      if (cancelled || !hostRef.current) return;
      const player = new YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: Math.floor(resumeAt) || 0,
        },
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
      try {
        playerRef.current?.destroy?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, watchKey]);

  return (
    <div className="mt-3">
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <div ref={hostRef} className="absolute inset-0 w-full h-full bg-black" />
      </div>
      <div className="mt-2 flex items-center gap-3 mono text-[10px] text-[var(--muted)] uppercase tracking-widest">
        <span>watched {Math.round(pct * 100)}%</span>
        <div className="flex-1 h-px bg-[var(--line)] relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-[var(--fg)]"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>
        {resumeAt > 1 && pct < 0.9 && (
          <span>
            resumed @ {Math.floor(resumeAt / 60)}:
            {String(Math.floor(resumeAt % 60)).padStart(2, "0")}
          </span>
        )}
        <span>{completedRef.current ? "✓ done" : "auto-ticks at 90%"}</span>
      </div>
    </div>
  );
}

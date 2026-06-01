// localStorage keys + safe load/save helpers
import type { WatchMap, WatchState } from "@/types";

export const STORAGE_KEYS = {
  progress: "gate-ae-progress-v1",
  notes: "gate-ae-notes-v1",
  resources: "gate-ae-resources-v2",
  resourcesLegacy: "gate-ae-resources-v1",
  revise: "gate-ae-revise-v1",
  ytKey: "gate-ae-yt-key-v1",
  watch: "gate-ae-watch-v1",
} as const;

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

const EMPTY_WATCH: WatchState = { watched: 0, pos: 0, dur: 0 };

export function loadWatch(videoId: string): WatchState {
  if (typeof window === "undefined") return EMPTY_WATCH;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.watch) || "{}") as WatchMap;
    return all[videoId] || EMPTY_WATCH;
  } catch {
    return EMPTY_WATCH;
  }
}

export function saveWatch(videoId: string, s: WatchState) {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.watch) || "{}") as WatchMap;
    all[videoId] = s;
    localStorage.setItem(STORAGE_KEYS.watch, JSON.stringify(all));
  } catch {}
}

export function clearWatchFor(videoIds: string[]) {
  if (typeof window === "undefined" || videoIds.length === 0) return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.watch) || "{}") as WatchMap;
    for (const id of videoIds) delete all[id];
    localStorage.setItem(STORAGE_KEYS.watch, JSON.stringify(all));
  } catch {}
}

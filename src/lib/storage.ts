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
  theme: "gate-ae-theme-v1",
  tourDone: "gate-ae-tour-done-v1",
  feedbackCooldown: "gate-ae-feedback-cooldown-v1",
  milestones: "gate-ae-milestones-v1",
  lastTouched: "gate-ae-last-touched-v1",
  dailyMailOpened: "gate-ae-daily-mail-v1",
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

// Reads watch state for `key`. If absent but a `fallbackKey` exists (legacy
// videoId-only entries from before per-playlist scoping), it migrates the
// fallback into `key` and returns it.
export function loadWatch(key: string, fallbackKey?: string): WatchState {
  if (typeof window === "undefined") return EMPTY_WATCH;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.watch) || "{}") as WatchMap;
    if (all[key]) return all[key];
    if (fallbackKey && all[fallbackKey]) {
      const fallback = all[fallbackKey];
      all[key] = fallback;
      localStorage.setItem(STORAGE_KEYS.watch, JSON.stringify(all));
      return fallback;
    }
    return EMPTY_WATCH;
  } catch {
    return EMPTY_WATCH;
  }
}

export function saveWatch(key: string, s: WatchState) {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.watch) || "{}") as WatchMap;
    all[key] = s;
    localStorage.setItem(STORAGE_KEYS.watch, JSON.stringify(all));
  } catch {}
}

export function clearWatchFor(keys: string[]) {
  if (typeof window === "undefined" || keys.length === 0) return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.watch) || "{}") as WatchMap;
    for (const id of keys) delete all[id];
    localStorage.setItem(STORAGE_KEYS.watch, JSON.stringify(all));
  } catch {}
}

// pure helpers around the syllabus data
import { type Section } from "@/lib/syllabus";
import type { Progress } from "@/types";

export function topicKey(s: Section, t: string, p: string) {
  return `${s.id}::${t}::${p}`;
}

export function sectionStats(s: Section, progress: Progress) {
  const all = [...s.core, ...s.special].flatMap((t) => t.points.map((p) => topicKey(s, t.name, p)));
  const done = all.filter((k) => progress[k]).length;
  return { done, total: all.length, pct: all.length ? done / all.length : 0 };
}

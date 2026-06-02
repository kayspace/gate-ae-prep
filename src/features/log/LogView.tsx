import { syllabus } from "@/lib/syllabus";
import { sectionStats } from "@/lib/syllabus-utils";
import type { Progress, Resources } from "@/types";

export function LogView({ progress, resources }: { progress: Progress; resources: Resources }) {
  const courses = Object.entries(resources).flatMap(([sid, list]) =>
    (list || [])
      .filter((r) => r.kind === "playlist" && r.videos && r.videos.length > 0)
      .map((r) => ({ sid, r })),
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
                  <div className="bar">
                    <i style={{ transform: `scaleX(${pct})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

import { syllabus } from "@/lib/syllabus";
import { sectionStats, topicKey } from "@/lib/syllabus-utils";
import { STORAGE_KEYS, loadJSON } from "@/lib/storage";
import type { Notes, Progress, Resources, Revisions, ViewKey } from "@/types";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { ViewNav } from "@/components/layout/ViewNav";
import { BackToTop } from "@/components/BackToTop";
import { MobileBlock } from "@/components/MobileBlock";

import { SyllabusView } from "@/features/syllabus/SyllabusView";
import { BooksView } from "@/features/books/BooksView";
import { ResourcesView } from "@/features/resources/ResourcesView";
import { ReviseView } from "@/features/revise/ReviseView";
import { LogView } from "@/features/log/LogView";
import { GuideView } from "@/features/guide/GuideView";
import { FeedbackView } from "@/features/feedback/FeedbackView";
import { TourOverlay } from "@/features/tour/TourOverlay";
import {
  MilestoneRibbon,
  type MilestoneEvent,
} from "@/features/motivation/MilestoneRibbon";
import { PickupBanner } from "@/features/motivation/PickupBanner";

export const Route = createFileRoute("/")({
  component: Home,
});

type Milestones = Record<string, 0 | 25 | 50 | 75 | 100>;
type LastTouched = { view: ViewKey; active: string; ts: number };

const THRESHOLDS: Array<0 | 25 | 50 | 75 | 100> = [0, 25, 50, 75, 100];
function currentThreshold(pct: number): 0 | 25 | 50 | 75 | 100 {
  const p = Math.round(pct * 100);
  let t: 0 | 25 | 50 | 75 | 100 = 0;
  for (const v of THRESHOLDS) if (p >= v) t = v;
  return t;
}

function Home() {
  const [progress, setProgress] = useState<Progress>({});
  const [notes, setNotes] = useState<Notes>({});
  const [resources, setResources] = useState<Resources>({});
  const [revisions, setRevisions] = useState<Revisions>({});
  const [active, setActive] = useState<string>("aptitude");
  const [view, setView] = useState<ViewKey>("syllabus");
  const [isHydrated, setIsHydrated] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [milestoneEvent, setMilestoneEvent] = useState<MilestoneEvent | null>(null);
  const [pickupLabel, setPickupLabel] = useState<string | null>(null);
  const milestonesRef = useRef<Milestones>({});
  const mainRef = useRef<HTMLDivElement>(null);

  // hydrate from localStorage
  useEffect(() => {
    const p = loadJSON<Progress>(STORAGE_KEYS.progress, {});
    setProgress(p);
    setNotes(loadJSON(STORAGE_KEYS.notes, {}));
    const v2 = loadJSON<Resources | null>(STORAGE_KEYS.resources, null);
    setResources(v2 ?? loadJSON(STORAGE_KEYS.resourcesLegacy, {}));
    setRevisions(loadJSON(STORAGE_KEYS.revise, {}));

    // seed milestones from current progress so we don't fire on first load
    const seeded: Milestones = loadJSON<Milestones>(STORAGE_KEYS.milestones, {});
    for (const s of syllabus) {
      const st = sectionStats(s, p);
      const cur = currentThreshold(st.pct);
      if ((seeded[s.id] ?? 0) < cur) seeded[s.id] = cur;
    }
    milestonesRef.current = seeded;
    try {
      localStorage.setItem(STORAGE_KEYS.milestones, JSON.stringify(seeded));
    } catch {}

    // last-touched restore
    const lt = loadJSON<LastTouched | null>(STORAGE_KEYS.lastTouched, null);
    if (lt) {
      if (lt.view) setView(lt.view);
      if (lt.active) setActive(lt.active);
      const stale = Date.now() - lt.ts;
      if (stale > 15 * 60 * 1000) {
        const sec = syllabus.find((s) => s.id === lt.active);
        const label =
          lt.view === "syllabus" && sec ? sec.title.toLowerCase() : lt.view;
        setPickupLabel(label);
      }
    }

    setIsHydrated(true);
  }, []);

  // first-visit tour auto-start
  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;
    try {
      const done = localStorage.getItem(STORAGE_KEYS.tourDone);
      if (!done) {
        const t = setTimeout(() => setTourOpen(true), 700);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [isHydrated]);

  // persist
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  }, [progress, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [notes, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.resources, JSON.stringify(resources));
  }, [resources, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.revise, JSON.stringify(revisions));
  }, [revisions, isHydrated]);

  // persist last-touched on view/active change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const payload: LastTouched = { view, active, ts: Date.now() };
      localStorage.setItem(STORAGE_KEYS.lastTouched, JSON.stringify(payload));
    } catch {}
  }, [view, active, isHydrated]);

  // milestone detection on progress change
  useEffect(() => {
    if (!isHydrated) return;
    const prev = milestonesRef.current;
    const next: Milestones = { ...prev };
    let fired: MilestoneEvent | null = null;
    for (const s of syllabus) {
      const st = sectionStats(s, progress);
      const cur = currentThreshold(st.pct);
      const last = prev[s.id] ?? 0;
      if (cur > last) {
        next[s.id] = cur;
        if (cur > 0 && !fired) {
          fired = {
            id: `${s.id}-${cur}-${Date.now()}`,
            section: s.title.toLowerCase(),
            threshold: cur as 25 | 50 | 75 | 100,
          };
        }
      } else if (cur < last) {
        // user unchecked back below — reset so they can fire again
        next[s.id] = cur;
      }
    }
    milestonesRef.current = next;
    try {
      localStorage.setItem(STORAGE_KEYS.milestones, JSON.stringify(next));
    } catch {}
    if (fired) setMilestoneEvent(fired);
  }, [progress, isHydrated]);

  // entrance animation
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

  const toggle = (key: string) => setProgress((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div ref={mainRef} className="min-h-screen">
      <AppHeader
        done={overall.done}
        total={overall.total}
        pct={overall.pct}
        onStartTour={() => setTourOpen(true)}
      />
      <PickupBanner label={pickupLabel} />
      <ViewNav view={view} onChange={setView} />

      {view === "syllabus" && (
        <SyllabusView
          progress={progress}
          notes={notes}
          active={active}
          setActive={setActive}
          toggle={toggle}
          setNotes={setNotes}
        />
      )}
      {view === "books" && <BooksView />}
      {view === "resources" && (
        <ResourcesView resources={resources} setResources={setResources} setView={setView} />
      )}
      {view === "revise" && <ReviseView revisions={revisions} setRevisions={setRevisions} />}
      {view === "log" && <LogView progress={progress} resources={resources} />}
      {view === "guide" && <GuideView />}
      {view === "feedback" && <FeedbackView />}

      <AppFooter />
      <BackToTop />
      <MobileBlock />
      <MilestoneRibbon event={milestoneEvent} />
      <TourOverlay
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        currentView={view}
        setView={setView}
      />
    </div>
  );
}

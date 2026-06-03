import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

import { syllabus } from "@/lib/syllabus";
import { topicKey } from "@/lib/syllabus-utils";
import { STORAGE_KEYS, loadJSON } from "@/lib/storage";
import type { Notes, Progress, Resources, Revisions, ViewKey } from "@/types";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { ViewNav } from "@/components/layout/ViewNav";
import { BackToTop } from "@/components/BackToTop";

import { SyllabusView } from "@/features/syllabus/SyllabusView";
import { BooksView } from "@/features/books/BooksView";
import { ResourcesView } from "@/features/resources/ResourcesView";
import { ReviseView } from "@/features/revise/ReviseView";
import { LogView } from "@/features/log/LogView";
import { GuideView } from "@/features/guide/GuideView";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [progress, setProgress] = useState<Progress>({});
  const [notes, setNotes] = useState<Notes>({});
  const [resources, setResources] = useState<Resources>({});
  const [revisions, setRevisions] = useState<Revisions>({});
  const [active, setActive] = useState<string>("aptitude");
  const [view, setView] = useState<ViewKey>("syllabus");
  const [isHydrated, setIsHydrated] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // hydrate from localStorage
  useEffect(() => {
    setProgress(loadJSON(STORAGE_KEYS.progress, {}));
    setNotes(loadJSON(STORAGE_KEYS.notes, {}));
    const v2 = loadJSON<Resources | null>(STORAGE_KEYS.resources, null);
    setResources(v2 ?? loadJSON(STORAGE_KEYS.resourcesLegacy, {}));
    setRevisions(loadJSON(STORAGE_KEYS.revise, {}));
    setIsHydrated(true);
  }, []);

  // persist on change (guarded so first-paint empty state never overwrites real data)
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

  // entrance animation on view/section change
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
      <AppHeader done={overall.done} total={overall.total} pct={overall.pct} />
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

      <AppFooter />
      <BackToTop />
    </div>
  );
}

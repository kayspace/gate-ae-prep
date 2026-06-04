import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { tourSteps } from "./steps";
import { STORAGE_KEYS } from "@/lib/storage";
import type { ViewKey } from "@/types";

const PAD = 8;

export function TourOverlay({
  open,
  onClose,
  currentView,
  setView,
}: {
  open: boolean;
  onClose: () => void;
  currentView: ViewKey;
  setView: React.Dispatch<React.SetStateAction<ViewKey>>;
}) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const current = tourSteps[step];
  const total = tourSteps.length;
  const isLast = step === total - 1;
  const isFirst = step === 0;

  const finish = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.tourDone, "1");
    } catch {}
    onClose();
  }, [onClose]);

  const next = useCallback(() => {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }, [isLast, finish]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  // reset to first step every time the tour opens
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  // switch view if the current step needs a different one
  useEffect(() => {
    if (!open || !current?.view) return;
    if (current.view !== currentView) setView(current.view);
  }, [open, current, currentView, setView]);

  // locate the target element (poll briefly after view switch / mount)
  useEffect(() => {
    if (!open) return;
    if (!current?.selector) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let tries = 0;

    const locate = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-tour="${current.selector}"]`);
      if (!el) {
        if (tries++ < 40) setTimeout(locate, 50);
        return;
      }
      if (current.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(
        () => {
          if (cancelled) return;
          setRect(el.getBoundingClientRect());
        },
        current.scrollIntoView ? 450 : 0,
      );
    };

    locate();

    const reposition = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${current.selector}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, current]);

  // animate spotlight box to the rect
  useEffect(() => {
    const node = spotlightRef.current;
    if (!node) return;
    if (!rect) {
      gsap.to(node, { opacity: 0, duration: 0.2, ease: "power2.out" });
      return;
    }
    gsap.to(node, {
      opacity: 1,
      x: rect.left - PAD,
      y: rect.top - PAD,
      width: rect.width + PAD * 2,
      height: rect.height + PAD * 2,
      duration: 0.5,
      ease: "power3.out",
    });
  }, [rect]);

  // fade tooltip in on each step change
  useEffect(() => {
    const node = tooltipRef.current;
    if (!node || !open) return;
    gsap.fromTo(
      node,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    );
  }, [step, open, rect]);

  // keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, back, finish]);

  if (!open) return null;

  // tooltip placement: prefer below the spotlight; flip above if no room.
  // when no rect, center it.
  // after
  const TIP_W = 320;
  const TIP_H_EST = 220;
  let tipStyle: React.CSSProperties;
  if (!rect) {
    tipStyle = {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: TIP_W,
    };
  } else {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top =
      step === 5 // step 6: above
        ? rect.top - TIP_H_EST - 20
        : step === 6 // step 7: middle
          ? rect.top + rect.height / 2 - TIP_H_EST / 2
          : rect.bottom + 130; // steps 2,3,4,5 (index 1,2,3,4): below
    const midpoint = vw / 2;
    const targetCenter = rect.left + rect.width / 2;
    const preferLeft =
      targetCenter > midpoint
        ? Math.max(20, rect.right - TIP_W) // target in right half: right-align tooltip to target
        : rect.left + rect.width / 2 - TIP_W / 2; // target in left half: center under target
    const left = Math.min(Math.max(20, preferLeft), vw - TIP_W - 20);
    tipStyle = { left, top, width: TIP_W };
  }

  return (
    <div className="fixed inset-0 z-[200]" aria-modal role="dialog">
      {/* full-screen dim when there's no spotlight target */}
      {!rect && <div className="absolute inset-0 bg-black/70" />}

      {/* spotlight box — its giant outer box-shadow dims everything else */}
      <div
        ref={spotlightRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
          boxShadow: rect ? "0 0 0 9999px rgba(0,0,0,0.72)" : "none",
          border: rect ? "1px solid var(--fg)" : "none",
          borderRadius: 2,
        }}
      />

      {/* click-eater so the page underneath stays inert during the tour */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: "auto", background: "transparent" }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-[var(--bg)] border border-[var(--fg)] p-5 shadow-lg"
        style={{
          ...tipStyle,
          pointerEvents: "auto",
          transform: rect ? "none" : "translate(-50%, -50%)",
        }}
      >
        <div className="flex items-baseline justify-between mb-3">
          <span className="tag">tour</span>
          <span className="mono text-[10px] text-[var(--muted)] tracking-widest">
            {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <h3 className="serif text-2xl lowercase mb-2">{current.title}</h3>
        <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">{current.body}</p>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={finish}
            className="mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            skip
          </button>
          <div className="flex gap-2">
            {!isFirst && (
              <button onClick={back} className="btn-ghost">
                back
              </button>
            )}
            <button onClick={next} className="btn-ghost active">
              {isLast ? "done" : "next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

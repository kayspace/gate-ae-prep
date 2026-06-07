import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { pickMilestoneQuote } from "@/lib/quotes";

export type MilestoneEvent = {
  id: string; // unique key to retrigger
  section: string;
  threshold: 25 | 50 | 75 | 100;
};

export function MilestoneRibbon({ event }: { event: MilestoneEvent | null }) {
  const [visible, setVisible] = useState<MilestoneEvent | null>(null);
  const [quote, setQuote] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!event) return;
    setQuote(pickMilestoneQuote(event.threshold));
    setVisible(event);
  }, [event]);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const el = ref.current;
    gsap.fromTo(
      el,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
    );
    const t = setTimeout(() => {
      gsap.to(el, {
        x: 80,
        opacity: 0,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => setVisible(null),
      });
    }, 5200);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="fixed bottom-8 right-6 md:right-10 z-40 max-w-sm border border-[var(--line)] bg-[var(--bg)] px-5 py-4 shadow-lg"
      style={{ opacity: 0 }}
    >
      <div className="mono text-[10px] tracking-widest text-[var(--faint)] uppercase">
        {visible.threshold === 100 ? "section complete" : `${visible.threshold}% · ${visible.section}`}
      </div>
      <div className="serif italic text-lg lowercase mt-2 leading-snug text-[var(--fg)]">
        {quote}
      </div>
    </div>
  );
}

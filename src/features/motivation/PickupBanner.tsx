import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export function PickupBanner({ label }: { label: string | null }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!label) return;
    setVisible(true);
  }, [label]);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const el = ref.current;
    gsap.fromTo(el, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
    const t = setTimeout(() => {
      gsap.to(el, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
        onComplete: () => setVisible(false),
      });
    }, 4200);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible || !label) return null;

  return (
    <div
      ref={ref}
      className="px-6 md:px-10 -mt-2 mb-2"
      style={{ opacity: 0 }}
    >
      <div className="serif italic text-sm text-[var(--muted)] lowercase">
        picking up where you left off · {label}
      </div>
    </div>
  );
}

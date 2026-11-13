"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window { __lenis?: Lenis }
}

/** Eased, slightly slow page scrolling, plus the scroll-driven drift on photographs. */
export function SmoothScroll() {
  const path = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (!reduce) {
      const l = new Lenis({ duration: 1.55, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, wheelMultiplier: 0.9 });
      lenis.current = l;
      window.__lenis = l;
    }
    const tick = (time: number) => {
      lenis.current?.raf(time);
      if (!reduce) {
        const vh = window.innerHeight;
        // 0 when a section's top reaches the bottom of the screen, 1 once it is two thirds of the way up
        document.querySelectorAll<HTMLElement>("[data-progress]").forEach((el) => {
          const r = el.getBoundingClientRect();
          const span = Number(el.dataset.progress) || 0.68; // how much of the screen it takes to fill
          const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * span)));
          el.style.setProperty("--p", p.toFixed(3));
        });
        document.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          const progress = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 to 0.5 across the viewport
          el.style.setProperty("--py", `${(-progress * r.height * 0.14).toFixed(1)}px`);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); lenis.current?.destroy(); lenis.current = null; window.__lenis = undefined; };
  }, []);

  useEffect(() => { lenis.current?.scrollTo(0, { immediate: true }); }, [path]);
  return null;
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** A photograph that wipes into view and drifts gently while scrolling. */
export function Photo({ src, alt = "", className = "", sizes = "(max-width: 860px) 100vw, 55vw", tint, priority, delay = 0, children, style }: {
  src: string; alt?: string; className?: string; sizes?: string; tint?: string; priority?: boolean; delay?: number; children?: ReactNode; style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`ph ${inView ? "in" : ""} ${className}`} data-drift style={{ ...style, "--d": `${delay}s`, "--tint": tint } as CSSProperties}>
      <div className="ph-c"><div className="ph-in"><Image src={src} alt={alt} fill sizes={sizes} priority={priority} /></div></div>
      {children}
    </div>
  );
}

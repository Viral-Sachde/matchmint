"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

function useInView<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: "0px 0px -3% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

/** Fades and lifts its children into place when scrolled into view. */
export function Reveal({ children, as = "div", delay = 0, className = "", kind = "rv", style }: {
  children?: ReactNode; as?: ElementType; delay?: number; className?: string; kind?: "rv" | "grow"; style?: CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return createElement(as, { ref, className: `${kind} ${inView ? "in" : ""} ${className}`, style: { ...style, "--d": `${delay}s` } as CSSProperties }, children);
}

type Part = string | { em: string } | { ask: string };
const textOf = (p: Part) => (typeof p === "string" ? p : "em" in p ? p.em : p.ask);

/** Headline that rises word by word from behind a mask. Pass {em:"words"} parts for emphasis. */
export function RevealText({ parts, as = "h2", className = "", delay = 0 }: { parts: Part[] | string; as?: ElementType; className?: string; delay?: number }) {
  const { ref, inView } = useInView<HTMLElement>();
  const list = typeof parts === "string" ? [parts] : parts;
  let i = 0;
  const label = list.map(textOf).join("").replace(/\n/g, " ");
  const nodes: ReactNode[] = [];
  list.forEach((part, pi) => {
    const text = textOf(part);
    const isEm = typeof part !== "string";
    const isAsk = typeof part !== "string" && "ask" in part;
    text.split(/(\n|\s+)/).forEach((tok, ti) => {
      if (tok === "\n") nodes.push(<br key={`${pi}-${ti}`} />);
      else if (/^\s+$/.test(tok)) nodes.push(" ");
      else if (tok) {
        const inner = <span style={{ "--i": i++ } as CSSProperties}>{tok}</span>;
        nodes.push(<span className="w" key={`${pi}-${ti}`} aria-hidden="true">{isEm ? <em className={isAsk ? "ask" : undefined}>{inner}</em> : inner}</span>);
      }
    });
  });
  return createElement(as, { ref, className: `rt ${inView ? "in" : ""} ${className}`, style: { "--d": `${delay}s`, "--s": `${Math.round(Math.min(34, 900 / Math.max(i, 1)))}ms` } as CSSProperties, "aria-label": label }, nodes);
}

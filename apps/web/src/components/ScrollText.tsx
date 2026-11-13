import type { CSSProperties } from "react";

type Part = string | { em: string } | { ask: string };
const textOf = (p: Part) => (typeof p === "string" ? p : "em" in p ? p.em : p.ask);

/**
 * A paragraph whose words light up one after another as it scrolls through the screen.
 * Progress comes from SmoothScroll via the data-progress attribute; without it the text shows in full.
 */
export function ScrollText({ parts, className = "", span = 1.15 }: { parts: Part[]; className?: string; span?: number }) {
  const words: { w: string; tone: "" | "em" | "ask" }[] = [];
  for (const p of parts) {
    const tone = typeof p === "string" ? "" : "em" in p ? "em" : "ask";
    for (const w of textOf(p).split(/\s+/).filter(Boolean)) words.push({ w, tone });
  }
  const label = parts.map(textOf).join("");
  return (
    <p className={`stext ${className}`} data-progress={span} aria-label={label}>
      {words.map(({ w, tone }, i) => (
        <span key={i} aria-hidden="true">
          <span className={`sw ${tone ? `sw-${tone}` : ""}`} style={{ "--t": (0.04 + (i / words.length) * 0.78).toFixed(3) } as CSSProperties}>{w}</span>{" "}
        </span>
      ))}
    </p>
  );
}

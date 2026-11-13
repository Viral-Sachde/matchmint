import Link from "next/link";
import type { ReactNode } from "react";

/** Ten logo concepts. `a` is the main colour, `b` the accent. */
export const MARKS: { name: string; idea: string; draw: (a: string, b: string) => ReactNode }[] = [
  { name: "Interlock", idea: "Two blocks that complete one square. A need and the backer that fits it.",
    draw: (a, b) => (<><path d="M4 4h40v16H20v24H4z" fill={a} /><path d="M24 24h20v20H24z" fill={b} /></>) },
  { name: "Overlap", idea: "Two circles and the ground they share.",
    draw: (a, b) => (<><circle cx="18" cy="24" r="14" fill={a} /><circle cx="30" cy="24" r="14" fill={a} opacity=".38" /><path d="M24 11.35a14 14 0 0 1 0 25.3a14 14 0 0 1 0-25.3z" fill={b} /></>) },
  { name: "Peak", idea: "A bold M. Two sides meeting at a single point.",
    draw: (a, b) => (<><path d="M7.5 42V9l16.5 20L40.5 9v33" fill="none" stroke={a} strokeWidth="7" strokeLinejoin="miter" /><path d="M20.5 37h7v7h-7z" fill={b} /></>) },
  { name: "Meet", idea: "Two arrows travelling toward each other.",
    draw: (a, b) => (<><path d="M4 9l15 15L4 39" fill="none" stroke={a} strokeWidth="7" /><path d="M44 9L29 24l15 15" fill="none" stroke={b} strokeWidth="7" /></>) },
  { name: "Leaf", idea: "A mint leaf in two halves, one for each party.",
    draw: (a, b) => (<><path d="M23 4C8 13 5 29 23 44z" fill={a} /><path d="M25 4c15 9 18 25 0 40z" fill={b} /></>) },
  { name: "Coin", idea: "A freshly minted coin stamped with the M.",
    draw: (a, b) => (<><circle cx="24" cy="24" r="19.5" fill="none" stroke={a} strokeWidth="5" /><path d="M15 32V17l9 10.5L33 17v15" fill="none" stroke={b} strokeWidth="4.5" /></>) },
  { name: "Halves", idea: "Two offset halves sliding into alignment.",
    draw: (a, b) => (<><path d="M22 4h-4a15 15 0 0 0 0 30h4z" fill={a} /><path d="M26 14h4a15 15 0 0 1 0 30h-4z" fill={b} /></>) },
  { name: "Grid", idea: "A field of options, with the line of matches picked out.",
    draw: (a, b) => (<>{[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (
      <rect key={`${r}${c}`} x={5 + c * 14} y={5 + r * 14} width="10" height="10" fill={r + c === 2 ? b : a} opacity={r + c === 2 ? 1 : 0.34} />
    )))}</>) },
  { name: "Arches", idea: "A lowercase m. The second arch is the partner arriving.",
    draw: (a, b) => (<><path d="M7.5 42V8M7.5 24a8.25 8.25 0 0 1 16.5 0v18" fill="none" stroke={a} strokeWidth="7" /><path d="M24 24a8.25 8.25 0 0 1 16.5 0v18" fill="none" stroke={b} strokeWidth="7" /></>) },
  { name: "Link", idea: "Two frames locked together, like links in a chain.",
    draw: (a, b) => (<><rect x="7" y="7" width="22" height="22" fill="none" stroke={a} strokeWidth="6" /><rect x="19" y="19" width="22" height="22" fill="none" stroke={b} strokeWidth="6" /><path d="M19 26v-7h7" fill="none" stroke={a} strokeWidth="6" /></>) },
];

/** Which concept the site uses. Change this number (0 to 9) once a logo is chosen. */
export const ACTIVE_MARK = 0;

export function Mark({ index = ACTIVE_MARK, a = "currentColor", b = "currentColor", size = 26 }: { index?: number; a?: string; b?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">{MARKS[index].draw(a, b)}</svg>
  );
}

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="logo" aria-label="MatchMint home" onClick={onClick}>
      <Mark />
      <span>MatchMint</span>
    </Link>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { Photo } from "./Photo";
import { Reveal, RevealText } from "./Reveal";
import { SplitButton, SplitButtonStatic } from "./SplitButton";

export type RowItem = { title: string; body: string; cta?: { label: string; href: string }; img: string; alt: string; chip?: ReactNode };

/** Numbered steps. Each pairs a photograph with a small piece of the product laid over it. */
export function Rows({ items }: { items: RowItem[] }) {
  return (
    <div className="rows pad">
      {items.map((r, i) => (
        <article className={`row ${i % 2 ? "flip" : ""}`} key={r.title}>
          <div className="row-copy">
            <Reveal as="span" className="mono row-n">Step {String(i + 1).padStart(2, "0")}</Reveal>
            <RevealText as="h3" className="d3" parts={r.title} />
            <Reveal delay={0.15}><p className="body">{r.body}</p></Reveal>
            {r.cta && <Reveal delay={0.25}><SplitButton href={r.cta.href}>{r.cta.label}</SplitButton></Reveal>}
          </div>
          <div className="row-media">
            <Photo src={r.img} alt={r.alt} />
            {r.chip && <Reveal delay={0.6} className="row-chip">{r.chip}</Reveal>}
          </div>
        </article>
      ))}
    </div>
  );
}

/** The two kinds of post, explained side by side. */
export function Kinds() {
  return (
    <section className="pad sec kinds">
      <div className="kinds-head">
        <Reveal as="span" className="mono dim">Two kinds of posts</Reveal>
        <RevealText as="h2" className="d2" parts={["Every post either ", { ask: "asks for backing" }, " or ", { em: "offers it." }]} />
      </div>
      <div className="duo">
        <Link href="/signup?as=seeker" className="t-pine on-dark hov">
          <span className="tag" style={{ color: "var(--olive)" }}>Seeking</span>
          <h3 className="d3">I need backing</h3>
          <p className="body">You run something that needs money, a sponsor or a partner. Say what you need and what a backer gets in return. Backers send you proposals.</p>
          <ul className="duo-ex">
            <li>An NGO seeking ₹50 L for a planting season</li>
            <li>A college fest seeking a hackathon partner</li>
            <li>A startup seeking funding for a pilot</li>
          </ul>
          <span><SplitButtonStatic variant="onblock">Post what you need</SplitButtonStatic></span>
        </Link>
        <Link href="/signup?as=backer" className="t-plum on-dark hov">
          <span className="tag" style={{ color: "var(--salmon)" }}>Offering</span>
          <h3 className="d3">I have backing to give</h3>
          <p className="body">You have a budget, products or expertise to put behind good work. Say who it is for. Seekers send you proposals and you choose.</p>
          <ul className="duo-ex">
            <li>A brand offering kit and cash to ten sports teams</li>
            <li>A bank offering CSR grants for money skills</li>
            <li>A company offering grants to developer meetups</li>
          </ul>
          <span><SplitButtonStatic variant="onblock">Post what you will back</SplitButtonStatic></span>
        </Link>
      </div>
      <Reveal className="kinds-foot">
        <p><b>The reply is called a proposal:</b> an amount and a short message.</p>
        <p><b>The side that pays decides.</b> Nothing is shared until a proposal is accepted.</p>
        <p><b>A match</b> unlocks contact details for both sides, and you take it from there.</p>
      </Reveal>
    </section>
  );
}

/** Splits a line into words that brighten one after another as the section scrolls in. */
function ScrollWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h2 className="d1" aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true"><span className="sw" style={{ "--t": (0.1 + (i / words.length) * 0.6).toFixed(2) } as React.CSSProperties}>{w}</span>{i < words.length - 1 ? " " : ""}</span>
      ))}
    </h2>
  );
}

/** Closing section. The green and maroon halves slide together and the words fill in as you scroll. */
export function CtaBand() {
  return (
    <section className="cta2" data-progress>
      <Link href="/signup?as=seeker" className="t-pine on-dark hov">
        <span className="mono" style={{ color: "var(--olive)" }}>For seekers</span>
        <ScrollWords text="Something worth backing?" />
        <span className="cta-act"><SplitButtonStatic variant="onblock">Post what you need</SplitButtonStatic></span>
      </Link>
      <Link href="/signup?as=backer" className="t-plum on-dark hov">
        <span className="mono" style={{ color: "var(--salmon)" }}>For backers</span>
        <ScrollWords text="A budget looking for it?" />
        <span className="cta-act"><SplitButtonStatic variant="onblock">Post what you will back</SplitButtonStatic></span>
      </Link>
    </section>
  );
}

/** Three short steps for the seeker and backer pages. */
export function Steps({ tone, items }: { tone: "pine" | "plum"; items: [string, string][] }) {
  return (
    <section className={`steps3 pad steps-${tone}`}>
      {items.map(([t, d], i) => (
        <Reveal key={t} delay={i * 0.1}>
          <span className="mono">Step {i + 1}</span>
          <h3>{t}</h3>
          <p>{d}</p>
        </Reveal>
      ))}
    </section>
  );
}

/** Small product fragments laid over photographs. */
export function ChipPost() {
  return (
    <div className="chip">
      <span className="tag req">Seeking · Funding</span>
      <b>Fund 50,000 native saplings before the monsoon</b>
      <span className="chip-row"><span>GreenRoots Foundation</span><span>₹5 L to ₹50 L</span></span>
    </div>
  );
}
export function ChipProposals() {
  return (
    <div className="chip">
      <span className="mono dim">3 proposals</span>
      {[["Northwind Bank", "₹25 L"], ["Kestrel Energy", "₹8 L"], ["Lumen Labs", "₹5 L"]].map(([n, a]) => (
        <span className="chip-row" key={n}><span>{n}</span><b>{a}</b></span>
      ))}
    </div>
  );
}
export function ChipMatch() {
  return (
    <div className="chip chip-ok">
      <span className="mono">Matched</span>
      <b>GreenRoots Foundation and Northwind Bank</b>
      <span className="chip-row"><span>Contact details shared</span><span>₹25 L</span></span>
    </div>
  );
}

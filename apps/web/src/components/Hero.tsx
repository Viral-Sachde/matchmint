import Image from "next/image";
import Link from "next/link";
import { SLUG_OF } from "@/lib/categories";
import { CATEGORIES, CATEGORY_INFO } from "@/lib/constants";
import { Reveal } from "./Reveal";
import { SplitButton } from "./SplitButton";

/** Home hero: the promise in large type, and every kind of work shown at once in a slow strip. */
export function Hero() {
  const tiles = [...CATEGORIES, ...CATEGORIES];
  return (
    <section className="hero">
      <div className="hero-copy pad">
        <h1 className="d1" aria-label="Where good work finds its backers">
          <span className="hero-line"><span>Where <span className="hero-olive">good work</span></span></span>
          <span className="hero-line two"><span>finds its <em>backers</em></span></span>
        </h1>
        <div className="hero-sub">
          <Reveal delay={0.7}>
            <p>Startups, NGOs, businesses, college fests, communities and more post what they need. Brands, funds and CSR teams post what they want to back. One board for both.</p>
          </Reveal>
          <Reveal delay={0.85} className="acts">
            <SplitButton href="/signup?as=seeker" variant="seek">I need backing</SplitButton>
            <SplitButton href="/signup?as=backer" variant="back">I want to back something</SplitButton>
          </Reveal>
        </div>
      </div>

      <div className="hero-strip">
        <div className="hero-track">
          {tiles.map((c, i) => (
            <Link key={`${c}${i}`} href={`/for/${SLUG_OF[c]}`} className="hero-tile" aria-hidden={i >= CATEGORIES.length} tabIndex={i >= CATEGORIES.length ? -1 : undefined}>
              <Image src={CATEGORY_INFO[c].img} alt="" fill sizes="(max-width: 860px) 60vw, 26vw" priority={i < 5} />
              <span><b>{CATEGORY_INFO[c].plural}</b><small>Looking for {CATEGORY_INFO[c].seeks}</small></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

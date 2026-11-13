import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import { Reveal, RevealText } from "@/components/Reveal";
import { CtaBand } from "@/components/Sections";
import { SplitButton } from "@/components/SplitButton";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <>
      <section className="sub">
        <div className="sub-copy">
          <Reveal as="span" className="mono">About MatchMint</Reveal>
          <RevealText as="h1" className="d1" parts={["Backing should not depend on ", { em: "who you know." }]} delay={0.15} />
          <Reveal delay={0.5}><p className="body">We are building the place where good work and the people willing to pay for it can find each other in the open.</p></Reveal>
        </div>
        <Photo src="/img/about-hands.jpg" alt="Many hands painted red, joined to form a heart" priority delay={0.3} sizes="(max-width: 960px) 100vw, 40vw" />
      </section>

      <section className="pad sec state">
        <Reveal as="span" className="mono dim">Why we exist</Reveal>
        <RevealText as="p" className="d2" parts={[
          "A tree-planting drive, a college festival, a run club, a first-time founder. Each one spends weeks writing to strangers, hoping one replies. Meanwhile sponsorship and CSR budgets go to whoever happened to be in the room. ",
          { em: "That is a matching problem, and it is fixable." },
        ]} />
      </section>

      <section className="pad">
        <div className="pair">
          <Photo src="/img/about-kids.jpg" alt="Children smiling at the camera" />
          <Photo src="/img/about-work.jpg" alt="Two people working through something at a laptop" delay={0.15} />
        </div>
      </section>

      <section className="pad sec">
        <div className="head">
          <div>
            <Reveal as="span" className="mono dim">What we believe</Reveal>
            <RevealText as="h2" className="d2" parts={["Three rules we ", { em: "build by" }]} />
          </div>
        </div>
        <div className="belief">
          <Reveal className="t-ice">
            <span className="mono">01</span>
            <h3>Say it plainly</h3>
            <p className="body">One post, in ordinary words, with a number on it. No decks, no jargon, no gatekeepers.</p>
          </Reveal>
          <Reveal className="t-olive" delay={0.1}>
            <span className="mono">02</span>
            <h3>The payer decides</h3>
            <p className="body">Whoever puts in the money makes the final call. It keeps every match honest and every yes real.</p>
          </Reveal>
          <Reveal className="t-pine on-dark" delay={0.2}>
            <span className="mono">03</span>
            <h3>Private until matched</h3>
            <p className="body">Your contact details stay hidden until a proposal is accepted. Then only the two of you see them.</p>
          </Reveal>
        </div>
      </section>

      <section className="pad sec state" style={{ paddingTop: 0 }}>
        <Reveal as="span" className="mono dim">Where this is going</Reveal>
        <div style={{ display: "grid", gap: 28, justifyItems: "start" }}>
          <RevealText as="p" className="d2" parts={[
            "MatchMint is built for every kind of work that deserves backing, from one creator to a national fest. Posting, proposals and matching work today. Payments, verification and reporting ",
            { em: "are next." },
          ]} />
          <Reveal><SplitButton href="/contact">Tell us what you need</SplitButton></Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

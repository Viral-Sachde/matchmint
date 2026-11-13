import type { Metadata } from "next";
import { Demo } from "@/components/Demo";
import { Reveal, RevealText } from "@/components/Reveal";
import { CtaBand } from "@/components/Sections";

export const metadata: Metadata = { title: "How it works" };

const TERMS: [string, string][] = [
  ["Seeking", "A post from someone who needs backing: money, a sponsor, a partner or support in kind."],
  ["Offering", "A post from someone who has backing to give, saying how much and who it is for."],
  ["Proposal", "A reply to a post. It always carries an amount and a short message."],
  ["Backer", "Whoever is putting in the money or support. A brand, a fund, a company or one person."],
  ["Seeker", "Whoever needs it. An NGO, a fest, a creator, a community, a team or a young company."],
  ["Match", "An accepted proposal. Both sides see each other's contact details from that moment."],
];

const FAQ: [string, string][] = [
  ["Who decides?", "The side that pays. If you post an Offering, you choose among the proposals you receive. If you are seeking, a backer's proposal is already their yes, and you confirm the one you want to take up."],
  ["What does it cost?", "Nothing. Posting, sending proposals and matching are free, and we take no commission on what you agree."],
  ["Does MatchMint handle the money?", "Not yet. A match shares contact details and the two sides agree terms and payment between themselves."],
  ["Who can see my contact details?", "Nobody, until a proposal is accepted. After that, only the two matched sides."],
  ["Can one account both seek and offer?", "Yes. A company can look for a pilot partner and sponsor a community from the same account."],
];

export default function HowItWorks() {
  return (
    <>
      <section className="intro pad">
        <Reveal as="span" className="mono dim">How it works</Reveal>
        <RevealText as="h1" className="d1" parts={["Post. Propose. ", { em: "Decide." }]} delay={0.1} />
        <Reveal delay={0.4}><p className="body">The whole product is three moves. The demo below is a working model: pick a side, watch the first two steps, then make the decision yourself.</p></Reveal>
      </section>

      <section className="pad" style={{ paddingBottom: "clamp(72px, 10vw, 150px)" }}>
        <Reveal><Demo /></Reveal>
      </section>

      <section className="pad sec" style={{ paddingTop: 0 }}>
        <div className="head">
          <div>
            <Reveal as="span" className="mono dim">The words we use</Reveal>
            <RevealText as="h2" className="d2" parts="Six terms and you know the product" />
          </div>
        </div>
        <Reveal>
          <dl className="gloss">
            {TERMS.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
          </dl>
        </Reveal>
      </section>

      <section className="pad sec t-off">
        <div className="head">
          <div>
            <Reveal as="span" className="mono dim">Questions</Reveal>
            <RevealText as="h2" className="d2" parts="Things people ask first" />
          </div>
        </div>
        <Reveal className="faq">
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </Reveal>
      </section>

      <CtaBand />
    </>
  );
}
